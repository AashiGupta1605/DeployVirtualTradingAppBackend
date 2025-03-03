// routes/admin/organizationRoutes.js
import express from 'express';
import { registerOrganization } from '../../../controllers/admin/organizationControllers.js';

const router = express.Router();

// Organization Routes
router.post('/OrgRegister', registerOrganization);

export default router;