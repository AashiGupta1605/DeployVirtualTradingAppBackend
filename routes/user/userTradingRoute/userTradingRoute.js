// routes/user/userTradingRoute/userTradingRoute.js
import express from 'express';
import {
  buyStock, 
  sellStock, 
  getTransactionHistory
} from '../../../controllers/user/userTrading/userTradingController.js';

const router = express.Router();

router.post('/trading/buy', buyStock);
router.post('/trading/sell', sellStock);
router.get('/trading/history/:userId', getTransactionHistory);

export default router;