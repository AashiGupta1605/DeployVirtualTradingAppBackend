// import express from 'express';
// import {
//   getOrgUserStats,
//   getOrgEventStats,
//   getOrgFeedbackStats,
//   getOrgComplaintStats
// } from '../../controllers/organization/organizationStatsController.js';
// // import { protect, orgAdmin } from '../../../middleware/authMiddleware.js';

// const router = express.Router();

// // Organization stats endpoints
// router.get('/users',  getOrgUserStats);
// router.get('/events',  getOrgEventStats);
// router.get('/feedback', getOrgFeedbackStats);
// router.get('/complaints',  getOrgComplaintStats);

// export default router;



import express from 'express';
import {
  getOrgUserStats,
  getOrgEventStats,
  getOrgFeedbackStats,
  getOrgComplaintStats,
  getOrgUserFeedbackStats,
  getOrgUserQueryStats,
  getStockStats,
  getGalleryStats
} from '../../controllers/organization/organizationStatsController.js';

const router = express.Router();

// Organization stats endpoints with orgName parameter
router.get('/:orgName/stats/users', getOrgUserStats);
router.get('/:orgName/stats/events', getOrgEventStats);
router.get('/:orgName/stats/feedback', getOrgFeedbackStats);
router.get('/:orgName/stats/complaints', getOrgComplaintStats);
router.get('/:orgName/stats/user-feedbacks', getOrgUserFeedbackStats);
router.get('/:orgName/stats/user-queries', getOrgUserQueryStats);
router.get('/:orgName/stats/stocks', getStockStats);
router.get('/:orgName/stats/gallery', getGalleryStats);


export default router;