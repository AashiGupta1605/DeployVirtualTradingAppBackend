import User from "../../models/UserModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerUserSchema, loginUserSchema, updateProfileSchema } from "../../helpers/userValidation.js"; // Import Joi schemas
import {
  updateUserValidation,
  deleteUserValidation,
} from '../../helpers/joiValidation.js';
// User registration
export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword, mobile, gender, dob, orgtype } = req.body;

  // Exclude confirmPassword from validation
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

    // if (orgtype) newUserData.orgtype = orgtype; // Only include if provided

    const newUser = await User.create(newUserData);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

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


// Get User Profile
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
export const updateProfile = async (req, res) => {
  const { id } = req.user; // User ID from auth middleware
  const { name, email, mobile, gender, dob} = req.body;

  // Joi validation
  const { error } = updateProfileSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, mobile, gender, dob },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error: error.message });
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
