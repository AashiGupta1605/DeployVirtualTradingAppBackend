// routes/organization/organizationRoute.js
import express from 'express';
import {
  // Auth controllers
  organizationRegister,
  organizationLogin,
  organizationForgotPassword, organizationResetPassword,
  // Organization controllers
  getAllOrgs,
  getOrgById,
  updateOrg,
  deleteOrg,
  updateApprovalStatus,
  searchOrganizations,
  getOrganizationById,
  updateOrganizationById,
  totalOrganizations,
  changeOrganizationPassword,
  verifyOrganizationOtp,
  resendOrganizationOtp
} from '../../controllers/organization/organizationController.js';
import authMiddleware from '../../middlewares/organizationMiddleware.js';

const router = express.Router();

// organization routes
router.post('/register', organizationRegister);
router.post('/login', organizationLogin);

router.post('/verify-otp', verifyOrganizationOtp);

router.post('/resend-otp', resendOrganizationOtp);
// Forgot Password - Send Reset Link
router.post("/forgot-password", organizationForgotPassword);

// Reset Password - Update New Password
router.post("/reset-password/:token", organizationResetPassword);

router.get("/by-id", authMiddleware, getOrganizationById); // GET organization by ID
router.put("/update-by-id", authMiddleware, updateOrganizationById);

//change password
router.put("/change-password", authMiddleware, changeOrganizationPassword);



// Admin List and search organizations
router.get('/list', getAllOrgs);
router.get('/search/:search', searchOrganizations);

// Protected routes - Organization specific operations
router.get('/details/:orgId', getOrgById);
router.put('/update/:orgId', updateOrg);
router.delete('/organization/:id', deleteOrg);
router.put('/status/:id', updateApprovalStatus); 


// User related routes
// router.get('/users/:orgName', verifyToken, getUserByOrgName);



// organization stats route for admin cards

router.get("/organizationCount/total", totalOrganizations);


export default router;