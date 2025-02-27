import express from 'express';
import {
  saveNiftyData,
  getNiftyData,
  getCompanyBySymbol,
  getAllCompanyDataBySymbol,
  registerOrganization,
  registerUser
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

export default router;