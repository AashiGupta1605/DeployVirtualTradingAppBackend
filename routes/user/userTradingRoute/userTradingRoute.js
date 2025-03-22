// routes/user/userTradingRoute/userTradingRoute.js
import express from 'express';
import {
  tradeStock, 
  getTransactionHistory,
  getHoldings
} from '../../../controllers/user/userTrading/userTradingController.js';

const router = express.Router();

router.post('/trading/trade', tradeStock);
router.get('/trading/history/:userId', getTransactionHistory);
// IMPORTANT: Add subscriptionPlanId to the holdings route
router.get('/trading/holdings/:userId/:subscriptionPlanId', getHoldings);

export default router;