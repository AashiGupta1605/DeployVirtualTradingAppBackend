import express from 'express';
import {
  saveNiftyData,
  getNiftyData,
  getCompanyBySymbol,
  getAllCompanyDataBySymbol,
  getStudentsByOrgName
} from '../../controllers/admin/adminControllers.js';
import { getETFData } from '../../scripts/scraper2.js';

const router = express.Router();

router.post('/niftydata', saveNiftyData);
router.get('/niftydata', getNiftyData);
router.get('/company/:symbol', getCompanyBySymbol);
router.get('/company/history/:symbol', getAllCompanyDataBySymbol);
router.get('/etfdata', getETFData);
router.get('/students/:orgName', getStudentsByOrgName);

export default router;