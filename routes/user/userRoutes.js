import express from "express";
import { 
  registerUser, 
  loginUser, 
  updateProfile, 
  deleteUser,
  getUsers,
  updateUser, 
  deleteUserById,
  getUserProfile, 
  createFeedback, 
  getAllFeedbacks, 
  getFeedbackById, 
  updateFeedback, 
  deleteFeedback 
} from "../../controllers/user/userController.js";
import { subscriptionPlanRoutes } from './userSubscriptionPlanRoutes/userSubscriptionPlanRoutes.js';
import userMiddleware from "../../middlewares/userMiddleware.js";

const router = express.Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", userMiddleware, getUserProfile);
router.put("/update", userMiddleware, updateProfile);
router.delete("/delete", userMiddleware, deleteUser);

//feedback routes 
router.post("/feedback", userMiddleware, createFeedback);
router.get("/feedbacks", userMiddleware, getAllFeedbacks);
router.get("/feedback/:id", userMiddleware, getFeedbackById);
router.put("/feedback/:id", userMiddleware, updateFeedback);
router.delete("/feedback/:id", userMiddleware, deleteFeedback);

// Admin Routes
router.get("/display-users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUserById);

// Mount subscription routes
router.use('/subscription-plans', subscriptionPlanRoutes);  // Use router.use instead of app.use

export default router;