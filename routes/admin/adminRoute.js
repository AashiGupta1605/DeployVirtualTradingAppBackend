import express from 'express';
import {
  saveNiftyData,
  getNiftyData,
  getCompanyBySymbol,
  getAllCompanyDataBySymbol,
  registerOrganization,
  registerUser,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedbackStatus,
  softDeleteFeedback,
  getFeedbackStats
} from '../../controllers/admin/adminControllers.js';
import { getETFData } from '../../scripts/scraper2.js';

const router = express.Router();

// Nifty Data Routes
router.post('/niftydata', saveNiftyData);
router.get('/niftydata', getNiftyData);

// Company Data Routes
router.get('/company/:symbol', getCompanyBySymbol);
router.get('/company/history/:symbol', getAllCompanyDataBySymbol);

// ETF Route
router.get('/etfdata', getETFData);


// backend/routes/organizationRoutes.js
router.post('/OrgRegister', registerOrganization);
router.post('/UserRegister', registerUser);

router.get('/feedbacks', getAllFeedbacks);
router.get('/feedbacks/stats', getFeedbackStats);
router.get('/feedbacks/:id', getFeedbackById);
router.patch('/feedbacks/:id/status', updateFeedbackStatus);
router.delete('/feedbacks/:id', softDeleteFeedback);

export default router;