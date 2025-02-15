import express from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  registerOrganization,
  updateApprovalStatus,
  updateOrganizationApprovalStatus,
} from "../controllers/orgControllers.js";

const router = express.Router();

// Routes
router.post("/", createOrganization);
router.get("/", getOrganizations);
router.get("/:id", getOrganizationById);
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);
router.post("/organizations", registerOrganization);
router.patch("/:id/approval", updateOrganizationApprovalStatus); // Use PATCH instead of PUT

export default router;