import express from 'express';
// import contactRoutes from './contactRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import userRoutes from "./userRoutes.js"

const router = express.Router();

// router.use(contactRoutes); 
router.use(feedbackRoutes);
router.use(userRoutes); 

export default router;