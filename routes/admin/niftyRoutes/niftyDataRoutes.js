// routes/admin/niftyDataRoutes.js
import express from 'express';
import {
  saveNiftyData,
  getNiftyData,
  getCompanyBySymbol,
  getAllCompanyDataBySymbol
} from '../../../controllers/admin/niftyDataControllers.js';

const router = express.Router();

// Nifty Data Routes
router.post('/data', saveNiftyData);
router.get('/data', getNiftyData);
router.get('/company/:symbol', getCompanyBySymbol);
router.get('/company/history/:symbol', getAllCompanyDataBySymbol);

export default router;