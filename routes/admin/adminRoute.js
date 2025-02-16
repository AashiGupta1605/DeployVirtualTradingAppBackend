import express from 'express';
import {
  saveNiftyData,
  getNiftyData,
  getCompanyBySymbol,
  getAllCompanyDataBySymbol,
} from '../../controllers/admin/adminControllers.js';

const router = express.Router();

router.post('/', saveNiftyData);
router.get('/niftydata', getNiftyData);
router.get('/company/:symbol', getCompanyBySymbol);
router.get('/symbol/:symbol', getAllCompanyDataBySymbol);

export default router;