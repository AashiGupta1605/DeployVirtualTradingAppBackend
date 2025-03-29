import User from "../../models/UserModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from '../../config/emailColfig.js'; 

import sendEmail from "../../utils/emailController.js";
  changePasswordSchema
  import { registerUserSchema, loginUserSchema, changePasswordSchema  } from "../../helpers/userValidation.js"; // Import Joi schemas
import {
  updateUserValidation,
  deleteUserValidation,
  
} from '../../helpers/joiValidation.js';
// User registration
// export const registerUser = async (req, res) => {
//   const { name, email, password, confirmPassword, mobile, gender, dob, orgtype } = req.body;

//   // Exclude confirmPassword from validation
//   const { error } = registerUserSchema.validate({ name, email, password, mobile, gender, dob });
//   if (error) return res.status(400).json({ message: error.details[0].message });

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUserData = {
//       name,
//       email,
//       password: hashedPassword,
//       mobile,
//       gender,
//       dob,
//     };

//     // if (orgtype) newUserData.orgtype = orgtype; // Only include if provided

//     const newUser = await User.create(newUserData);

//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.status(201).json({ message: "User registered successfully", token, user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed", error: error.message });
//   }
// };
export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword, mobile, gender, dob, orgtype } = req.body;

  // Validate input (Exclude confirmPassword from validation)
  const { error } = registerUserSchema.validate({ name, email, password, mobile, gender, dob });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      name,
      email,
      password: hashedPassword,
      mobile,
      gender,
      dob,
    };

    const newUser = await User.create(newUserData);
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // ✅ **Send Welcome Email**
    const subject = "Welcome to PGR Virtual Trading Platform!";
    const message = `Hello ${name}, <br> Welcome to PGR Virtual Trading Platform! Start your trading journey today.`;
    await sendEmail(email, subject, message);

    res.status(201).json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};


// User login
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   // Joi validation
//   const { error } = loginUserSchema.validate(req.body);
//   if (error) return res.status(400).json({ message: error.details[0].message });

//   try {
//     const user = await User.findOne({ email }).select("+password");
//     if (!user) return res.status(400).json({ message: "Invalid email or password" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

//     // Generate token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.json({ message: "Successfully logged in", token, user });
//   } catch (error) {
//     res.status(500).json({ message: "Login failed", error: error.message });
//   }
// };
export const loginUser = async (req, res) => { 
  const { email, mobile, password } = req.body;

  // Joi validation
  const { error } = loginUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    console.log("Login request received for:", { email, mobile });
    // Find user by email or mobile
    const user = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    }).select("+password +isDeleted"); // Include isDeleted field

    if (!user) return res.status(400).json({ message: "not a registered user" });

    console.log(user);
    
    // Check if user is deleted
    if (user.isDeleted) return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email/mobile or password" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Successfully logged in", token, user });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};


// export const changePassword = async (req, res) => {
//   try {
//     // Ensure `req.user.id` is coming from authentication middleware
//     const userId = req.user ? req.user.id : req.body.userId;
//     const { oldPassword, newPassword } = req.body;

//     if (!userId) return res.status(400).json({ message: "User ID is required" });

//     // Find user in the database
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Check if old password matches
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" });

//     // Hash new password before saving
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Save the updated user
//     await user.save();

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// Get User Profile
export const changePassword = async (req, res) => {
  try {
    console.log("🔹 Received password change request:", req.body);

    // ✅ Validate input without userId
    const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });

    if (error) {
      console.log(" Joi Validation Error:", error.details);
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Extract userId from JWT

    console.log(" Extracted User ID from JWT:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log(" User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log(" User found:", user.email);

    // 🔹 Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log(" Old password is incorrect");
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 🔹 Prevent changing to the same password
    if (oldPassword === newPassword) {
      console.log("New password must be different");
      return res.status(400).json({ message: "New password must be different from the old password" });
    }

    // 🔹 Hash and update the new password
    console.log("🔹 Hashing new password...");
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log("✅ Password updated successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(" Error in changePassword controller:", error);
    res.status(500).json({ message: "Password change failed", error: error.message });
  }
};


// Forgot Password Handler
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate Reset Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    console.log("Token:", token);
    // Send Email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    console.log("Reset Link:", resetLink);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link expires in 15 minutes.</p>`,
    });

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
};

// Reset Password Handler
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword, confirmPassword } = req.body;

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Verify Token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(404).json({ message: "Invalid or expired token" });
//     }

//     // Hash New Password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     await user.save();
//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error resetting password", error: error.message });
//   }
// };

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Reset link has expired. Please request a new one." });
      }
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};



export const getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Retrieved from userMiddleware

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};


// Update User Profile (without email change)
// export const updateProfile = async (req, res) => {
//   const { id } = req.user; // User ID from auth middleware
//   const { name, email, mobile, gender, dob} = req.body;

//   // Joi validation
//   const { error } = updateProfileSchema.validate(req.body);
//   if (error) return res.status(400).json({ message: error.details[0].message });

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { name, email, mobile, gender, dob },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) return res.status(404).json({ message: "User not found" });

//     res.json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: "Profile update failed", error: error.message });
//   }
// };


// abhsihek udpate image

import cloudinary from '../../helpers/cloudinary.js'; // Adjust the path as necessary

export const updateProfile = async (req, res) => {
  const { id } = req.user; // User ID from auth middleware
  const updateData = req.body; // Data to update

  if (!id) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    // Log the update data for debugging
    console.log("Update Data:", updateData);

    // Handle photo upload to Cloudinary
    if (updateData.userPhoto && updateData.userPhoto.startsWith('data:image')) {
      // Find the user to get the current photo URL
      const user = await User.findById(id);
      if (user.userPhoto && user.userPhoto !== "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png") {
        // Extract the public_id from the URL
        const publicId = user.userPhoto.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`user_photos/${publicId}`); // Delete the old image from Cloudinary
      }

      // Upload the new photo to Cloudinary
      const result = await cloudinary.uploader.upload(updateData.userPhoto, {
        folder: 'user_photos', // Optional: Organize images in a folder
      });
      updateData.userPhoto = result.secure_url; // Update with the new photo URL
    }

    // Handle photo removal (reset to default image)
    if (updateData.userPhoto === "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png") {
      const user = await User.findById(id);
      if (user.userPhoto && user.userPhoto !== "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png") {
        const publicId = user.userPhoto.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`user_photos/${publicId}`); // Delete the old image from Cloudinary
      }
      updateData.userPhoto = "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png"; // Set to default image
    }

    // Find the user by ID and update it
    const updatedUser = await User.findByIdAndUpdate(
      id, // Query by ID
      { $set: updateData }, // Use $set to update only the specified fields
      { new: true, runValidators: true } // Return the updated document and run validators
    ).select('-password'); // Exclude the password field from the response

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Log the updated user for debugging
    console.log("Updated User:", updatedUser);

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete User (Soft Delete)
export const deleteUser = async (req, res) => { 
  const { id } = req.user; // Authenticated user ID

  console.log("Authenticated User ID:", id); // Debugging

  try {
    // Joi validation for ID
    const { error } = deleteUserValidation.validate({ id });
    if (error) {
      console.error("Validation Error:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(id);
    console.log("User Found:", user); // Debugging

    if (!user || user.isDeleted) {
      console.error("User not found or already deleted");
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    user.isDeleted = true; // Soft delete user
    await user.save();

    console.log("User deletion successful");
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    res.status(500).json({ message: "User deletion failed", error: error.message });
  }
};

// Get All Users (for admin)
export const getUsers = async (req, res) => {
  try {
    res.json(await User.find({addedby:"self", isDeleted: false }));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update User by ID (for admin)
export const updateUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = updateUserValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    });

    // Update timestamp
    user.updatedDate = Date.now();

    // Save updated user
    const updatedUser = await user.save();

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: "Error updating user", 
      error: error.message 
    });
  }
};

// Delete User by ID (for admin)
export const deleteUserById = async (req, res) => {
  try {
    // Validate request params
    const { error } = deleteUserValidation.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isDeleted = true;
    await user.save();
    res.json({ message: "User removed successfully (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

//Get Approved and Non-Deleted Users Data (for GuestUser)
export const getApprovedUsers = async (req, res) => {
  try {
    const approvedUsers = await User.find({ status: true, isDeleted: false });
    res.status(200).json({ success: true, data: approvedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
