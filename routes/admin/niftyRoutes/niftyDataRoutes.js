// routes/admin/niftyRoutes/niftyDataRoutes.js
import express from 'express';
import {
  saveNiftyData,
  getNiftyData,
  getCompanyBySymbol,
  getChartDataBySymbol,
  getHistoricalDataBySymbol
} from '../../../controllers/admin/niftyDataControllers.js';
import { asyncHandler } from '../../../middlewares/errorHandler.js';

const router = express.Router();

// Chart and Historical data routes
router.get('/company/chart/:symbol', asyncHandler(getChartDataBySymbol));
router.get('/company/history/:symbol', asyncHandler(getHistoricalDataBySymbol));

// Existing routes
router.get('/company/:symbol', asyncHandler(getCompanyBySymbol));
router.get('/data', asyncHandler(getNiftyData));
router.post('/data', asyncHandler(saveNiftyData));

export default router;