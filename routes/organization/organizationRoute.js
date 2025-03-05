// routes/organization/organizationRoute.js
import express from 'express';
import {
  // Auth controllers
  organizationRegister,
  organizationLogin,
  
  // Organization controllers
  getAllOrgs,
  getOrgById,
  updateOrg,
  deleteOrg,
  updateApprovalStatus,
  getUserByOrgName,
  getOrganizationById,
  updateOrganization,
  searchOrganizations
} from '../../controllers/organization/organizationController.js';
import { verifyToken } from '../../helpers/jwtHandler.js';

const router = express.Router();

// Public routes
router.post('/register', organizationRegister);
router.post('/login', organizationLogin);

// Organization profile routes
router.get('/profile/:orgId', getOrganizationById);
router.put('/profile/:orgId', verifyToken, updateOrganization);

// Admin List and search organizations
router.get('/list', getAllOrgs);
router.get('/search/:search', searchOrganizations);

// Protected routes - Organization specific operations
router.get('/details/:orgId', getOrgById);
router.put('/update/:orgId', updateOrg);
router.delete('/organization/:id', deleteOrg);
router.put('/status/:id', updateApprovalStatus); 

// User related routes
router.get('/users/:orgName', verifyToken, getUserByOrgName);

export default router;