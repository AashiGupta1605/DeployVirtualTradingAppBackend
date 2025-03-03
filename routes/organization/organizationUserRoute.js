import express from 'express';
import {
  organizationUserRegistration,
  organizationUsersDisplay,
  organizationgetUserDisplayById,
  organizationUpdateUser,
  organizationUserDelete,
  organizationTotalUsers,
  organizationNewUsersLastWeek,
  organizationMaleUsers,
  organizationFemaleUsers,
  organizationActiveUsers,
  organizationDeactiveUsers,
  organizationAverageUserAge,
} from '../../controllers/organization/organizationUsersController.js';

const router = express.Router();

// Organization user routes
router.post('/user/register', organizationUserRegistration);
router.get('/user/display-all-users', organizationUsersDisplay);
router.get('/:orgName/users', organizationUsersDisplay);
router.get('/user/:id', organizationgetUserDisplayById);
router.put('/user/:id', organizationUpdateUser);
router.delete('/user/:id', organizationUserDelete);

// orgainzation user statistics
router.get('/:orgName/users/count/total', organizationTotalUsers);
router.get('/:orgName/users/count/new-week', organizationNewUsersLastWeek);
router.get('/:orgName/users/count/male', organizationMaleUsers);
router.get('/:orgName/users/count/female', organizationFemaleUsers);
router.get('/:orgName/users/count/active', organizationActiveUsers);
router.get('/:orgName/users/count/deactive', organizationDeactiveUsers);
router.get('/:orgName/users/count/average-age', organizationAverageUserAge);

export default router;