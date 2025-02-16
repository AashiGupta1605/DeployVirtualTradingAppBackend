import express from "express";
import { createOrg, getAllOrgs, getOrgById, updateOrg, deleteOrg, updateApprovalStatus } from "../../controllers/admin/orgRegisterController.js";

const router = express.Router();

router.post("/create", createOrg);
router.get("/", getAllOrgs);
router.get("/:id", getOrgById);
router.put("/:id", updateOrg);
router.delete("/:id", deleteOrg);
router.patch("/:id/approve", updateApprovalStatus);

export default router;