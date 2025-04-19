// // // routes/admin/userRoutes.js
// // import express from 'express';
// // import {totalUsers, maleUsers, femaleUsers, activeUsers, deactiveUsers, averageUserAge, totalOrganizations, organizationTotalUsers, organizationMaleUsers, organizationFemaleUsers, organizationActiveUsers, organizationDeactiveUsers, organizationAverageUserAge, getOrganizationStats, getUserStats, getEventStats, getFeedbackStats, getQueryStats  } from '../../../controllers/admin/statsController.js';
// // import { getDashboardStats } from '../../../controllers/admin/adminDashboardController.js';

// // const router = express.Router();

// // // User Routes
// // router.get('/user/totalUsers', totalUsers);
// // router.get('/user/totalMaleUsers', maleUsers);
// // router.get('/user/totalFemaleUsers', femaleUsers);
// // router.get('/user/totalActiveUsers', activeUsers);
// // router.get('/user/totalDeactiveUsers', deactiveUsers);
// // router.get('/user/averageUserAge', averageUserAge);
// // router.get('/user/averageUserAge', averageUserAge);



// // router.get('/dashboard', getDashboardStats);

// // // Individual category endpoints
// // router.get('/users', getUserStats);
// // router.get('/organizations', getOrganizationStats);
// // router.get('/events', getEventStats);
// // router.get('/feedback', getFeedbackStats);
// // router.get('/queries', getQueryStats);


// // // Organization Routes
// // router.get('/organization/totalOrganizations', totalOrganizations);
// // router.get('/organization/organizationTotalUsers', organizationTotalUsers);
// // router.get('/organization/organizationTotalMaleUsers', organizationMaleUsers);
// // router.get('/organization/organizationTotalFemaleUsers', organizationFemaleUsers);
// // router.get('/organization/organizationTotalActiveUsers', organizationActiveUsers);
// // router.get('/organization/organizationTotalDeactiveUsers', organizationDeactiveUsers);
// // router.get('/organization/organizationAverageUserAge', organizationAverageUserAge);

// // // http://localhost:5000/v1/api/admin/stats/user/totalDeactiveUsers



// // export default router;








// import express from 'express';
// import {
//   getUserStats,
//   getOrganizationStats,
//   getEventStats,
//   getFeedbackStats,
//   getQueryStats
// } from '../../../controllers/admin/statsController.js';
// import { getDashboardStats} from "../../../controllers/admin/adminDashboardController.js"
// const router = express.Router();

// // Dashboard stats endpoint
// router.get('/dashboard', getDashboardStats);

// // Individual category endpoints
// router.get('/users', getUserStats);
// router.get('/organizations', getOrganizationStats);
// router.get('/events', getEventStats);
// router.get('/feedback', getFeedbackStats);
// router.get('/queries', getQueryStats);

// export default router;

import express from 'express';
import {
  getUserStats,
  getOrganizationStats,
  getEventStats,
  getFeedbackStats,
  getQueryStats,
  getBasicComplaintStats,
  getStockStats,
  getGalleryStats
} from '../../../controllers/admin/statsController.js';

const router = express.Router();

// Individual stats endpoints - admin stats routes
router.get('/users', getUserStats);
router.get('/organizations', getOrganizationStats);
router.get('/events', getEventStats);
router.get('/feedback', getFeedbackStats);
router.get('/queries', getQueryStats);
router.get('/complaints', getBasicComplaintStats);
router.get('/stocks', getStockStats);
router.get('/gallery', getGalleryStats);


export default router;