// routes/user/authRoutes/authRoutes.js
import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, verifyResetToken } from '../../../controllers/user/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-reset-token/:token", verifyResetToken);

export default router;