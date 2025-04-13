// routes/user/authRoutes/authRoutes.js
import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, verifyResetToken, verifyOtp, sendOtpToEmail } from '../../../controllers/user/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-reset-token/:token", verifyResetToken);
router.post("/send-otp", sendOtpToEmail); 
router.post("/verify-otp", verifyOtp);


export default router;