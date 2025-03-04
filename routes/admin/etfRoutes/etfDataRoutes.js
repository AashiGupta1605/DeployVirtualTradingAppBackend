// routes/admin/etfRoutes.js
import express from 'express';
import { getETFBySymbol, getETFHistoricalData } from '../../../controllers/admin/etfControllers.js';

const router = express.Router();

router.get('/historical/:symbol', getETFHistoricalData);
router.get('/:symbol', getETFBySymbol);

export default router;