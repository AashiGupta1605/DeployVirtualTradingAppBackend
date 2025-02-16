import express from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  registerOrganization,
  updateOrganizationApprovalStatus,
} from "../../controllers/admin/orgControllers.js";

const router = express.Router();

router.post("/", createOrganization);
router.get("/", getOrganizations);
router.get("/:id", getOrganizationById);
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);
router.post("/organizations", registerOrganization);
router.patch("/:id/approval", updateOrganizationApprovalStatus);

export default router;