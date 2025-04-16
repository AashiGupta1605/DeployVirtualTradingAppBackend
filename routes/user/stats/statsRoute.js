// routes/user/statsRoutes.js
import express from 'express';
import {
  getUserStats,
  getEventStats,
  getFeedbackStats,
  getComplaintStats,
  getQueryStats,
  getSubscriptionStats
} from '../../../controllers/user/statsController.js';

const router = express.Router();

// User-specific stats endpoints
router.get('/:userId/users', getUserStats);
router.get('/:userId/events', getEventStats);
router.get('/:userId/feedback', getFeedbackStats);
router.get('/:userId/complaints', getComplaintStats);
router.get('/:userId/queries', getQueryStats);
router.get('/:userId/subscription', getSubscriptionStats);
// router.get('/:userId/stocks', getStockStats);


export default router;