import express from "express";
import { 
  createOrg, 
  getAllOrgs, 
  getOrgById, 
  updateOrg, 
  deleteOrg, 
  updateApprovalStatus 
} from "../controllers/orgRegisterController.js";

const router = express.Router();

router.post("/create", createOrg);        // Create Organization
router.get("/", getAllOrgs);              // Get All Organizations
router.get("/:id", getOrgById);           // Get Organization by ID
router.put("/:id", updateOrg);            // Update Organization
router.delete("/:id", deleteOrg);         // Delete Organization
router.patch("/:id/approve", updateApprovalStatus); // Approve/Reject Organization

export default router;
