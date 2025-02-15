import express from "express";
import { registerUser, loginUser, updateProfile, deleteUser } from "../../controllers/user/authController.js";
import authMiddleware from "../../middlewares/authMiddleware.js"; // Corrected path for middleware

const router = express.Router();

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Get Logged-in User Profile
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = req.user; // Retrieved from authMiddleware
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
});

// Update User Profile
router.put("/update", authMiddleware, updateProfile);

// Delete User
router.delete("/delete", authMiddleware, deleteUser);

export default router;
