import express from 'express';
import {
  buySellStock, getTransactionHistory
} from '../../../controllers/user/userTrading/userTradingController.js';

const router = express.Router();

router.post('/buysell', buySellStock);
router.get('/history/:userId', getTransactionHistory);

export default router;