import express from 'express';
import organizationRoutes from './organizationRoute.js';
import organizationUserRoutes from './organizationUserRoute.js';
import organizationStatsRoute from "./organizationStatsRoute.js"
const router = express.Router();

// Combine organization and organizationUser routes
router.use(organizationRoutes); // Routes for organization
router.use(organizationUserRoutes); // Routes for organizationUser
router.use(organizationStatsRoute);

export default router;