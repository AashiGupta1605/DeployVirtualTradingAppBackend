// routes/user/userTradingRoute/userTradingRoute.js
import express from 'express';
import {
  tradeStock, 
  getTransactionHistory,
  getHoldings,
  getEventSpecificTransactions
} from '../../../controllers/user/userTrading/userTradingController.js';

const router = express.Router();

router.post('/trading/trade', tradeStock);
router.get('/trading/history/:userId', getTransactionHistory);
// IMPORTANT: Add subscriptionPlanId to the holdings route
router.get('/trading/holdings/:userId/:subscriptionPlanId', getHoldings);
// Change this route to match your controller
// router.get('/:eventId/transactions/:userId', getEventSpecificTransactions);
router.get('/:eventId/transactions/:userId', getEventSpecificTransactions);

export default router;