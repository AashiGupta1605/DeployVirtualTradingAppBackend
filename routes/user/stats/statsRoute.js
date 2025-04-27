// routes/user/statsRoutes.js
import express from 'express';
import {
  getUserStats,
  getEventStats,
  getFeedbackStats,
  getComplaintStats,
  getQueryStats,
  getSubscriptionStats,
  getCertificateStats,
  getParticipationStats
} from '../../../controllers/user/statsController.js';

const router = express.Router();

// User-specific stats endpoints
router.get('/:userId/users', getUserStats);
router.get('/:userId/events', getEventStats);
router.get('/:userId/feedback', getFeedbackStats);
router.get('/:userId/complaints', getComplaintStats);
router.get('/:userId/queries', getQueryStats);
router.get('/:userId/subscription', getSubscriptionStats);
router.get('/:userId/certificates', getCertificateStats);
router.get('/:userId/participation', getParticipationStats);

// router.get('/users', getUserStats);
// router.get('/events', getEventStats);
// router.get('/feedback', getFeedbackStats);
// router.get('/complaints', getComplaintStats);
// router.get('/queries', getQueryStats);
// router.get('/subscription', getSubscriptionStats);
// // router.get('/:userId/stocks', getStockStats);


export default router;