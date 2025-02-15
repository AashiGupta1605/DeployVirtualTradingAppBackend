import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User registration
export const registerUser = async (req, res) => {
  const { name, email, password, mobile, gender, dob } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, mobile, gender, dob });

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
  const { name, mobile, gender, dob } = req.body;
  
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, mobile, gender, dob },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.user; // Authenticated user ID

  try {
    const user = await User.findById(id);

    if (!user || user.deleted) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    user.deleted = true; // Soft delete user
    await user.save();

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "User deletion failed", error: error.message });
  }
};