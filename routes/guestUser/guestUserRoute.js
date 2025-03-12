import express from 'express';
import { getAllUsersFeedbacks, getAllCompleteFeedbacks, getAllOrganizationsFeedbacks} from '../../controllers/user/feedbackController.js';
import { searchOrganizations } from '../../controllers/organization/organizationController.js';
import { getApprovedUsers } from '../../controllers/user/userController.js';

const router = express.Router();

router.get('/userFeedbacks/:organization/:category/:recommend/:search/:sortBy/:order', getAllUsersFeedbacks);
router.get('/userFeedbacks/:sortBy/:order', getAllUsersFeedbacks);

router.get('/organizationFeedbacks/:organization/:category/:recommend/:search/:sortBy/:order',getAllOrganizationsFeedbacks)
router.get('/organizationFeedbacks/:sortBy/:order',getAllOrganizationsFeedbacks)

router.get('/getAllOrganizations/:search',searchOrganizations);
router.get('/getAllOrganizations',searchOrganizations);

router.get('/getAllUsers',getApprovedUsers)


export default router;