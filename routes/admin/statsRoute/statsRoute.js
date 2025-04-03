// routes/admin/userRoutes.js
import express from 'express';
import {totalUsers, maleUsers, femaleUsers, activeUsers, deactiveUsers, averageUserAge, totalOrganizations, organizationTotalUsers, organizationMaleUsers, organizationFemaleUsers, organizationActiveUsers, organizationDeactiveUsers, organizationAverageUserAge  } from '../../../controllers/admin/statsController.js';

const router = express.Router();

// User Routes
router.get('/user/totalUsers', totalUsers);
router.get('/user/totalMaleUsers', maleUsers);
router.get('/user/totalFemaleUsers', femaleUsers);
router.get('/user/totalActiveUsers', activeUsers);
router.get('/user/totalDeactiveUsers', deactiveUsers);
router.get('/user/averageUserAge', averageUserAge);



// Organization Routes
router.get('/organization/totalOrganizations', totalOrganizations);
router.get('/organization/organizationTotalUsers', organizationTotalUsers);
router.get('/organization/organizationTotalMaleUsers', organizationMaleUsers);
router.get('/organization/organizationTotalFemaleUsers', organizationFemaleUsers);
router.get('/organization/organizationTotalActiveUsers', organizationActiveUsers);
router.get('/organization/organizationTotalDeactiveUsers', organizationDeactiveUsers);
router.get('/organization/organizationAverageUserAge', organizationAverageUserAge);

// http://localhost:5000/v1/api/admin/stats/user/totalDeactiveUsers



export default router;
