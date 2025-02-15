import express from 'express';
import { registerOrganization, loginOrganization } from '../../controllers/organization/Organizationontroller.js';

const router = express.Router();

router.post('/register', registerOrganization);

router.post('/login', loginOrganization);

export default router;