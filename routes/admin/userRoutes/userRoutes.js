// routes/admin/userRoutes.js
import express from 'express';
import { registerUser } from '../../../controllers/admin/userControllers.js';

const router = express.Router();

// User Routes
router.post('/UserRegister', registerUser);

export default router;
