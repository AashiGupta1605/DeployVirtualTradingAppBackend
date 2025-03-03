// routes/admin/feedbackRoutes.js
import express from 'express';
import {
  getAllFeedbacks,
  getFeedbackById,
  updateFeedbackStatus,
  softDeleteFeedback,
  getFeedbackStats
} from '../../controllers/user/feedbackController.js';

const router = express.Router();

// Feedback Routes
router.get('/', getAllFeedbacks);
router.get('/stats', getFeedbackStats);
router.get('/:id', getFeedbackById);
router.patch('/:id/status', updateFeedbackStatus);
router.delete('/:id', softDeleteFeedback);

export default router;
