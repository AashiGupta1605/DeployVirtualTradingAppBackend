import User from "../../models/UserModal.js";
import OtpVerification from "../../models/OtpVerification.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from '../../config/emailColfig.js'; 
import moment from "moment";
import sendEmail from "../../utils/emailController.js";
import sendOtp from "../../utils/sendOtp.js";
import { registerUserSchema, loginUserSchema, changePasswordSchema, passwordValidationSchema, emailValidationSchema } from "../../helpers/userValidation.js"; // Import Joi schemas
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
// export const registerUser = async (req, res) => {
//   const { name, email, password, confirmPassword, mobile, gender, dob, orgtype } = req.body;

//   // Validate input (Exclude confirmPassword from validation)
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
    
//     const newUser = await User.create(newUserData);
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     // ✅ **Send Welcome Email**
//     const subject = "Welcome to PGR Virtual Trading App!";
//     const message = `Hello ${name}, <br> Welcome to PGR Virtual Trading App! Start your trading journey today.`;
//     await sendEmail(email, subject, message);

//     res.status(201).json({ message: "User registered successfully", token, user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed", error: error.message });
//   }

// };
// export const registerUser = async (req, res) => {
//   const { name, email, password, confirmPassword, mobile, gender, dob, orgtype } = req.body;

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

//     const newUser = await User.create(newUserData);
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     // ✅ Send OTP Email
//     //await sendOtp(email);

//     // ✅ Send Welcome Email
//     const subject = "Welcome to PGR Virtual Trading App!";
//     const message = `Hello ${name}, <br> Welcome to PGR Virtual Trading App! Start your trading journey today.`;
//     await sendEmail(email, subject, message);

//     res.status(201).json({ message: "User registered successfully", token, user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed", error: error.message });
//   }
// };

export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword, mobile, gender, dob, orgtype } = req.body;

  const { error } = registerUserSchema.validate({ name, email, password, mobile, gender, dob });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const existingUser = await User.findOne({ email });

    // 👇 If user exists but is not verified
    if (existingUser) {
      if (existingUser.status === "not approved") {
        await sendOtp(existingUser.email); 
        return res.status(400).json({
          message: "User already registered but not verified. Please verify OTP.",
          status: "not_verified",
          emailAlreadyExists: true,
        });
        
      }
      
      // 👇 Fully registered and approved user
      return res.status(400).json({ message: "User already exists",
        status: "already_verified", });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      name,
      email,
      password: hashedPassword,
      mobile,
      gender,
      dob,
      status: "not approved", // 👈 Ensure new users are marked not approved by default
    };

    const newUser = await User.create(newUserData);
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // ✅ Send OTP Email


    // ✅ Send Welcome Email
    const subject = "Welcome to PGR Virtual Trading App!";
    const message = `Hello ${name}, <br> Welcome to PGR Virtual Trading App! Start your trading journey today.`;
    await sendEmail(email, subject, message);

    res.status(201).json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};
// export const registerUser = async (req, res) => {
//   const { name, email, password, confirmPassword, mobile, gender, dob, orgtype } = req.body;

//   const { error } = registerUserSchema.validate({ name, email, password, mobile, gender, dob });
//   if (error) return res.status(400).json({ message: error.details[0].message });

//   try {
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       // 👉 Email already exists, directly send response for resend OTP
//       return res.status(409).json({
//         message: "Email already exists. Please verify with OTP.",
//         emailAlreadyExists: true,
//       });
//     }

//     // 👉 New user - Create and send OTP
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       mobile,
//       gender,
//       dob,
//       status: "not approved",
//     });

//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     await sendOtp(email);

//     const subject = "Welcome to PGR Virtual Trading App!";
//     const message = `Hello ${name}, <br> Welcome to PGR Virtual Trading App! Start your trading journey today.`;
//     await sendEmail(email, subject, message);

//     res.status(201).json({ message: "User registered successfully", token, user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed", error: error.message });
//   }
// };



export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;

  try {
    await sendOtp(email);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
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

    if (!user) return res.status(400).json({ message: "Not a registered user" });
    
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


export const verifyOtp = async (req, res) => {
  const { email, enteredOtp } = req.body;

  try {
    const record = await OtpVerification.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    // Check if OTP is expired (e.g., 10 minutes expiry)
    const otpExpiryTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    const currentTime = new Date().getTime();

    if (currentTime - record.createdAt.getTime() > otpExpiryTime) {
      // OTP expired, delete the record
      await OtpVerification.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== enteredOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update OTP status to approved
    record.status = "approved";
    await record.save();

    // Optionally, update User status to approved
    await User.updateOne({ email }, { status: "approved" });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
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
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
    
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
    
//      //Generate Reset Token (expires in 15 minutes)
//      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
//      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=user`;
     
//      console.log("Generated Reset Token:", token);
//      console.log("Reset Link:", resetLink);
     
//      //Send Reset Email
//      const subject = "Password Reset Request";
//      const message = "Click the button below to reset your password. This link expires in 15 minutes.";
     
//      await sendEmail(
//       email,
//       subject,
//       message,
//       [],                 // No attachments
//       "Reset Password",   // buttonText
//       resetLink,          // buttonLink
//       false               // showHomeLink
//     );
    
     
//      res.status(200).json({ message: "Password reset link sent to your email" });
//     } catch (error) {
//      console.error("Error in forgotPassword:", error);
//      res.status(500).json({ message: "Error sending email", error: error.message });
//    }
// };
export const forgotPassword = async (req, res) => {
  try {
    // Validate the email using Joi
    const { error } = emailValidationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate Reset Token (expires in 15 minutes)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=user`;
    
    console.log("Generated Reset Token:", token);
    console.log("Reset Link:", resetLink);

    // Send Reset Email
    const subject = "Password Reset Request";
    const message = "Click the button below to reset your password. This link expires in 15 minutes.";

    await sendEmail(
      email,
      subject,
      message,
      [],                 // No attachments
      "Reset Password",   // buttonText
      resetLink,          // buttonLink
      false               // showHomeLink
    );

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
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

    const { error } = passwordValidationSchema.validate({ newPassword, confirmPassword });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
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

// ✅ Verify Reset Token Controller
export const verifyResetToken = async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, process.env.JWT_SECRET); // Will throw if expired or invalid
    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset link has expired. Please request a new one." });
    }
    return res.status(400).json({ message: "Invalid or expired reset token" });
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
    //res.json(await User.find({addedby:"self", isDeleted: false, status: "approved"  }));
    res.json(await User.find({
      addedby: "self",
      isDeleted: false,
      status: { $in: ["approved", "not approved"] }
    }));
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
    const approvedUsers = await User.find({ status: 'approved' });
    res.status(200).json({ success: true, data: approvedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};










// user stats for admin cards ---------------------------

// export const totalUsers = async (req, res) => {

//   try {
//     const count = await User.countDocuments({ isDeleted: false });
//     res.status(200).json({ success: true, count });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total user fetched succesffully"  });
//   }
// };


// export const maleUsers = async (req, res) => {

//   try {
//     const maleUsersCount = await User.countDocuments({
//       gender: "Male",
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: maleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching male users"  });
//   }
// };

// export const femaleUsers = async (req, res) => {

//   try {
//     const femaleUsersCount = await User.countDocuments({
//       gender: "Female",
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: femaleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching female users"  });
//   }
// };


// export const activeUsers = async (req, res) => {
//   try {
//     const activeUsersCount = await User.countDocuments({
//       status: true,
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: activeUsersCount, msg:"fetched active user successfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg });
//   }
// };

// export const deactiveUsers = async (req, res) => {

//   try {
//     const deactiveUsersCount = await User.countDocuments({
//       status: false,
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: deactiveUsersCount, msg:"fetched inactive user successfully" }  );
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

// export const averageUserAge = async (req, res) => {
//   try {
//     const users = await User.find({ isDeleted: false }, 'dob');
//     const totalAge = users.reduce((sum, user) => {
//       const age = moment().diff(user.dob, 'years');
//       return sum + age;
//     }, 0);
//     const averageAge = totalAge / users.length;
//     res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:"average age fetch succesfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg });
//   }
// };





// -------------------------user stats for admin cards inclding all

import { ORG_ACTIVE_USER_FETCHED_SUCCESS, ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS, ORG_DEACTIVE_USER_FETCHED_SUCCESS, ORG_FEMALE_USER_FETCHED_SUCCESS, ORG_MALE_USER_FETCHED_SUCCESS, ORG_NEW_USER_FETCHED_SUCCESS, ORG_TOTAL_USER_FETCHED_SUCCESS, SERVER_ERROR } from '../../helpers/messages.js';
import OrgRegister from '../../models/OrgRegisterModal.js';
import Feedback from "../../models/FeedbackModel.js";
import ContactUs from "../../models/ContactUsModal.js";


// USER STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------


export const totalUsers = async (req, res) => {

  try {
    const count = await User.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total user fetched succesffully"  });
  }
};


export const maleUsers = async (req, res) => {

  try {
    const maleUsersCount = await User.countDocuments({
      gender: "Male",
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: maleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching male users"  });
  }
};

export const femaleUsers = async (req, res) => {

  try {
    const femaleUsersCount = await User.countDocuments({
      gender: "Female",
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: femaleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching female users"  });
  }
};


export const activeUsers = async (req, res) => {
  try {
    const activeUsersCount = await User.countDocuments({
      status: true,
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: activeUsersCount, msg:"fetched active user successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg });
  }
};

export const deactiveUsers = async (req, res) => {

  try {
    const deactiveUsersCount = await User.countDocuments({
      status: false,
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: deactiveUsersCount, msg:"fetched inactive user successfully" }  );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const averageUserAge = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }, 'dob');
    const totalAge = users.reduce((sum, user) => {
      const age = moment().diff(user.dob, 'years');
      return sum + age;
    }, 0);
    const averageAge = totalAge / users.length;
    res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:"average age fetch succesfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg });
  }
};




// ORGANIZATION STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------


export const totalOrganizations = async (req, res) => {

  try {
    const count = await OrgRegister.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:"total organization count fetched succesffully"  });
  }
};


export const organizationTotalUsers = async (req, res) => {
    try {
      // Count users that are not deleted and were added by organizations (not self-registered)
      const count = await User.countDocuments({ 
        isDeleted: false,
        addedby: { $ne: "self" } // $ne means "not equal"
      });
      
      res.status(200).json({ 
        success: true, 
        count,
        msg: "Total organization-registered users count fetched successfully" 
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ 
        success: false, 
        msg: "Server error while fetching organization-registered users count",
        error: error.message 
      });
    }
  };



export const organizationMaleUsers = async (req, res) => {

  try {
    const maleUsersCount = await User.countDocuments({
      gender: "Male",
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: maleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_MALE_USER_FETCHED_SUCCESS  });
  }
};

export const organizationFemaleUsers = async (req, res) => {

  try {
    const femaleUsersCount = await User.countDocuments({
      gender: "Female",
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: femaleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_FEMALE_USER_FETCHED_SUCCESS  });
  }
};

export const organizationActiveUsers = async (req, res) => {
  try {
    const activeUsersCount = await User.countDocuments({
      status: true,
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: activeUsersCount, msg:ORG_ACTIVE_USER_FETCHED_SUCCESS  });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationDeactiveUsers = async (req, res) => {

  try {
    const deactiveUsersCount = await User.countDocuments({
      status: false,
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: deactiveUsersCount, msg:ORG_DEACTIVE_USER_FETCHED_SUCCESS  });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationAverageUserAge = async (req, res) => {

  try {
    const users = await User.find({ isDeleted: false,  addedby: { $ne: "self" }   }, 'dob');
    const totalAge = users.reduce((sum, user) => {
      const age = moment().diff(user.dob, 'years');
      return sum + age;
    }, 0);
    const averageAge = totalAge / users.length;
    res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};





// EVENTS STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------


export const totalEvents = async (req, res) => {
  try {
    const count = await Event.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:"total event count fetched succesffully"  });
  }
};

export const totalUpcomingEvents = async (req, res) => {
  try {
    const count = await Event.countDocuments({ isDeleted: false, type:"upcoming" });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:"total event upcoming count fetched succesffully"  });
  }
};

export const totalCompletedEvents = async (req, res) => {
  try {
    const count = await Event.countDocuments({ isDeleted: false, type:"completed" });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:"total event completed count fetched succesffully"  });
  }
};

export const totalOngoingEvents = async (req, res) => {
  try {
    const count = await Event.countDocuments({ isDeleted: false, type:"ongoing" });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:"total event ongoing count fetched succesffully"  });
  }
};





// FEEDBACK STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------


export const totalFeedbacks = async (req, res) => {
  try {
    const count = await Feedback.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:"total feedback count fetched succesffully"  });
  }
};


export const getAverageRating = async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);
    
    const averageRating = result[0]?.averageRating || 0;
    res.status(200).json({ success: true, averageRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get recommendation percentage
export const getRecommendationRate = async (req, res) => {
  try {
    const total = await Feedback.countDocuments({ isDeleted: false });
    const recommended = await Feedback.countDocuments({ 
      isDeleted: false, 
      recommend: true 
    });
    
    const recommendationRate = total > 0 ? (recommended / total) * 100 : 0;
    res.status(200).json({ 
      success: true, 
      recommendationRate: recommendationRate.toFixed(2) 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get feedback count by type (organization/user)
export const getFeedbackCountByType = async (req, res) => {
  try {
    const counts = await Feedback.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$feedbackType", count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({ success: true, data: counts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// QUERIES (CONTACT US MODEL) STATS FOR ADMIN CARDS DASHBOARD -------------------------------------------

export const totalQueries = async (req, res) => {
  try {
    const count = await ContactUs.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:"total query count fetched succesffully"  });
  }
};

