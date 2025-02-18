import User from "../../models/UserModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerUserSchema, loginUserSchema, updateProfileSchema } from "../../helpers/userValidation.js"; // Import Joi schemas

// User registration
export const registerUser = async (req, res) => {
  const { name, email, password, mobile, gender, dob, orgtype } = req.body;

  // Joi validation
  const { error } = registerUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      mobile, 
      gender, 
      dob, 
      orgtype 
    });

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Joi validation
  const { error } = loginUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Successfully logged in", token, user });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Update User Profile (without email change)
export const updateProfile = async (req, res) => {
  const { id } = req.user; // User ID from auth middleware
  const { name, mobile, gender, dob, orgtype } = req.body;

  // Joi validation
  const { error } = updateProfileSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, mobile, gender, dob, orgtype },
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

  try {
    // Joi validation for ID
    const { error } = deleteUserSchema.validate({ id });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    user.isDeleted = true; // Soft delete user
    await user.save();

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    Object.keys(req.body).forEach(key => user[key] = req.body[key] ?? user[key]);
    user.updatedDate = Date.now();
    res.json(await user.save());
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete User by ID (for admin)
export const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isDeleted = true;
    await user.save();
    res.json({ message: "User removed successfully (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};
