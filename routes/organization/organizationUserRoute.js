import express from 'express';
import {
  organizationUserRegistration,
  organizationUsersDisplay,
  organizationgetUserDisplayById,
  organizationUpdateUser,
  organizationUserDelete,
  // organizationTotalUsers,
  // organizationNewUsersLastWeek,
  // organizationMaleUsers,
  // organizationFemaleUsers,
  // organizationActiveUsers,
  // organizationDeactiveUsers,
  // organizationAverageUserAge,
  // organizationDashboardStats,
} from '../../controllers/organization/organizationUsersController.js';
import authMiddleware from '../../middlewares/organizationMiddleware.js';

const router = express.Router();

// Organization user routes
router.post('/user/register', authMiddleware, organizationUserRegistration);
router.get('/user/display-all-users', authMiddleware, organizationUsersDisplay);
router.get('/:orgName/users', authMiddleware, organizationUsersDisplay);
router.get('/user/:id', authMiddleware, organizationgetUserDisplayById);
router.put('/user/:id', authMiddleware, organizationUpdateUser);
router.delete('/user/:id', authMiddleware, organizationUserDelete);

// orgainzation user statistics
// router.get('/:orgName/users/count/total', organizationTotalUsers);
// router.get('/:orgName/users/count/new-week', organizationNewUsersLastWeek);
// router.get('/:orgName/users/count/male', organizationMaleUsers);
// router.get('/:orgName/users/count/female', organizationFemaleUsers);
// router.get('/:orgName/users/count/active', organizationActiveUsers);
// router.get('/:orgName/users/count/deactive', organizationDeactiveUsers);
// router.get('/:orgName/users/count/average-age', organizationAverageUserAge);



// one route for organization user detail

// router.get('/:orgName/dashboard', organizationDashboardStats);

export default router;