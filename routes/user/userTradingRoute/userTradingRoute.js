import express from 'express';
import {
  buyStock, sellStock, getTransactionHistory
} from '../../../controllers/user/userTrading/userTradingController.js';

const router = express.Router();

router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.get('/history/:userId', getTransactionHistory);

export default router;