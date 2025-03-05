import express from 'express';

import { getUserFeedback, getAllFeedback } from '../../controllers/user/feedbackController.js';
import { searchOrganizations } from '../../controllers/organization/organizationController.js';
import { getAllOrgs } from '../../controllers/organization/organizationController.js';

const router = express.Router();

router.get('/userFeedback/:category/:sortBy/:order', getUserFeedback);
router.get('/userFeedback/:sortBy/:order', getUserFeedback);
router.get('/userFeedback',getAllFeedback);

router.get('/searchOrganization/:search',searchOrganizations);
router.get('/searchOrganization',searchOrganizations);

router.get('/display-all-org',getAllOrgs)

export default router;