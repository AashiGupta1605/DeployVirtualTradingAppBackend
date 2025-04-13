// routes/user/profileRoutes/profileRoutes.js
import express from 'express';
import { 
  getUserProfile, 
  updateProfile, 
  deleteUser,
  // Add these admin-related controllers
  getUsers,
  updateUser,
  deleteUserById, 
  changePassword, 
  maleUsers,
  femaleUsers,
  activeUsers,
  deactiveUsers,
  averageUserAge,
  totalUsers,
  organizationTotalUsers,
  organizationMaleUsers,
  organizationFemaleUsers,
  organizationActiveUsers,
  organizationDeactiveUsers,
  organizationAverageUserAge,
  totalOrganizations
} from '../../../controllers/user/userController.js';
import userMiddleware from '../../../middlewares/userMiddleware.js';

const router = express.Router();

// User Profile Routes
router.get('/profile', userMiddleware, getUserProfile);
router.put('/update', userMiddleware, updateProfile);
router.delete('/delete', userMiddleware, deleteUser);

// Change Password Route
router.put('/change-password', userMiddleware, changePassword);


// Admin User Management Routes
router.get("/display-users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUserById);// Changed from /users/:id to /admin/users/:id


// admin users stats count
// router.get("/userCount/total", totalUsers);
// router.get("/userCount/male", maleUsers);
// router.get("/userCount/female", femaleUsers);
// router.get("/userCount/active", activeUsers);
// router.get("/userCount/deactive", deactiveUsers);
// router.get("/userCount/averageAge", averageUserAge);



// // organization admin stats count 
// router.get("/organizationCount/total", totalOrganizations);
// router.get("/organizationCount/totalUsers", organizationTotalUsers);
// router.get("/organizationCount/male", organizationMaleUsers);
// router.get("/organizationCount/female", organizationFemaleUsers);
// router.get("/organizationCount/active", organizationActiveUsers);
// router.get("/organizationCount/deactive", organizationDeactiveUsers);
// router.get("/organizationCount/averageAge", organizationAverageUserAge);



// router.get("/userCount/", getUsers);


export default router;