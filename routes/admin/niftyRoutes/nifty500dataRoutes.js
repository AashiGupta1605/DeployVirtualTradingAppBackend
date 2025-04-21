// routes/admin/niftyRoutes/nifty500dataRoutes.js
import express from 'express';
import {
  saveNifty500Data,
  getNifty500Data,
  getCompanyBySymbol,
  getChartDataBySymbol,
  getLatestBySymbol,
  getHistoricalDataBySymbol
} from '../../../controllers/admin/nifty500Controllers.js';
import { asyncHandler } from '../../../middlewares/errorHandler.js';

const router = express.Router();

// Note: The order of routes matters! Put more specific routes first
router.get('/company/chart/:symbol', asyncHandler(getChartDataBySymbol));
router.get('/company/:symbol', asyncHandler(getCompanyBySymbol));
router.get('/company/history/:symbol', asyncHandler(getHistoricalDataBySymbol));
router.get('/symbol/:symbol', asyncHandler(getLatestBySymbol));
router.get('/all', asyncHandler(getNifty500Data));
router.post('/save', asyncHandler(saveNifty500Data));

export default router;