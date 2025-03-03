// routes/admin/adminRoutes.js
import express from 'express';
import niftyDataRoutes from './niftyRoutes/niftyDataRoutes.js';
import organizationRoutes from './organizationRoutes/organizationRoutes.js';
import userRoutes from './userRoutes/userRoutes.js';
import { getETFData } from '../../scripts/scraper2.js';

const router = express.Router();

// Nifty Data Routes
router.use('/nifty', niftyDataRoutes);

// ETF Data Routes
router.get('/etfdata', getETFData);

// Organization Routes
router.use('/', organizationRoutes);

// User Routes
router.use('/', userRoutes);

export default router;