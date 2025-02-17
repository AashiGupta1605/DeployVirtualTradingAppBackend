import express from 'express';
import {
  saveNiftyData,
  getNiftyData,
  getCompanyBySymbol,
  getAllCompanyDataBySymbol,
getStudentsByOrgName,getOrganizations, getOrganizationById, updateOrganization, deleteOrganization, updateApprovalStatus, updateOrganizationApprovalStatus,
} from '../../controllers/admin/adminControllers.js';
import {
  getETFData
} from '../../scripts/scraper2.js';

const router = express.Router();

router.post('/', saveNiftyData);
router.get('/niftydata', getNiftyData);
router.get('/company/:symbol', getCompanyBySymbol);
router.get('/symbol/:symbol', getAllCompanyDataBySymbol);

router.get('/etfdata', getETFData);

//ORGrEGISTERrOUTES
router.get("/display", getOrganizations);
router.get("/:id", getOrganizationById);
router.put("/:id", updateOrganization);
router.delete("/:id",  deleteOrganization);
router.patch("/:id/approve", updateApprovalStatus);
router.patch("/:id/approve", updateOrganizationApprovalStatus);

//orgStudetneRoutes

router.get("/by-org/:orgName", getStudentsByOrgName);

export default router;