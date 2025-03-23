// routes/user/profileRoutes/profileRoutes.js
import express from 'express';
import { 
  getUserProfile, 
  updateProfile, 
  deleteUser,
  // Add these admin-related controllers
  getUsers,
  updateUser,
  deleteUserById, 
  changePassword 
} from '../../../controllers/user/userController.js';
import userMiddleware from '../../../middlewares/userMiddleware.js';

const router = express.Router();

// User Profile Routes
router.get('/profile', userMiddleware, getUserProfile);
router.put('/update', userMiddleware, updateProfile);
router.delete('/delete', userMiddleware, deleteUser);

// Change Password Route
router.put('/change-password', userMiddleware, changePassword);

// Admin User Management Routes
router.get("/display-users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUserById);// Changed from /users/:id to /admin/users/:id

export default router;