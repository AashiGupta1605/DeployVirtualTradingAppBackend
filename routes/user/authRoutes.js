import express from "express";
import { 
  registerUser, 
  loginUser, 
  updateProfile, 
  deleteUser,
  getUsers,
  updateUser, 
  deleteUserById
 
} from "../../controllers/user/authController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = req.user; // Retrieved from authMiddleware
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
});
router.put("/update", authMiddleware, updateProfile);
router.delete("/delete", authMiddleware, deleteUser);

// Admin Routes
router.get("/admin/users", getUsers);
router.put("/admin/users/:id", updateUser);
router.delete("/admin/users/:id", deleteUserById);

export default router;