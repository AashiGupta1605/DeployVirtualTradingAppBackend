import express from "express";
import { 
  registerUser, 
  loginUser, 
  updateProfile, 
  deleteUser,
  getUsers,
  updateUser, 
  deleteUserById
 
} from "../../controllers/user/userController.js";
import userMiddleware from "../../middlewares/userMiddleware.js";

const router = express.Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", userMiddleware, async (req, res) => {
  try {
    const user = req.user; // Retrieved from authMiddleware
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
});
router.put("/update", userMiddleware, updateProfile);
router.delete("/delete", userMiddleware, deleteUser);

// Admin Routes
router.get("/display-users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUserById);

export default router;