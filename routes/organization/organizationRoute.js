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
  searchOrganizations,
  getOrganizationById,
  updateOrganizationById
} from '../../controllers/organization/organizationController.js';

const router = express.Router();

// organization routes
router.post('/register', organizationRegister);
router.post('/login', organizationLogin);
// router.get('/by-name', getOrganizationByName);
// router.put('/update-by-name', updateOrganizationByName);

router.get("/by-id", getOrganizationById); // GET organization by ID
router.put("/update-by-id", updateOrganizationById);


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

export default router;