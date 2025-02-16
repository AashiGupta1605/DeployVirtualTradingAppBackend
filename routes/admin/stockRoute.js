import express from 'express';
import { scrapeAndStoreETFData, getETFData } from '../../controllers/admin/stockController.js';

const router = express.Router();

router.get('/scrape-etf', scrapeAndStoreETFData);
router.get('/stocks', getETFData);

export default router;