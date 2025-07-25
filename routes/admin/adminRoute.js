// routes/admin/adminRoutes.js
import express from 'express';
import niftyDataRoutes from './niftyRoutes/niftyDataRoutes.js';
import nifty500DataRoutes from './niftyRoutes/nifty500dataRoutes.js';
import organizationRoutes from './organizationRoutes/organizationRoutes.js';
import userRoutes from './userRoutes/userRoutes.js';
import etfRoutes from '../admin/etfRoutes/etfDataRoutes.js';

import galleryCategoryRoutes from '../admin/galleryRoutes/galleryCategoryRoutes.js'
import galleryDataRoutes from '../admin/galleryRoutes/galleryDataRoutes.js'
import demoRoutes from './demoRoutes.js'

import eventRoutes from './eventRoutes/eventRoutes.js'; // Import the event routes
import statsRoute from "./statsRoute/statsRoute.js";
import { getETFData } from '../../scripts/scraper2.js';

// import fileUpload from 'express-fileupload';

const router = express.Router();

// router.use(fileUpload())

// Nifty Data Routes
router.use('/nifty', niftyDataRoutes);
router.use('/nifty500', nifty500DataRoutes);
router.use('/etf', etfRoutes);

// ETF Data for table Routes
router.get('/etfdata', getETFData);

// Organization Routes
router.use('/', organizationRoutes);

// User Routes
router.use('/', userRoutes);


//Gallery Routes
router.use('/galleryCategory', galleryCategoryRoutes)
router.use('/gallery', galleryDataRoutes)

//Demo Routes
router.use('/demo', demoRoutes)

// Event Routes
router.use('/events', eventRoutes); // Add the event routes


// Stats Route

router.use('/stats', statsRoute); // Add the event routes



export default router;