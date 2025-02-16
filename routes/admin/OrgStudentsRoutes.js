import express from "express";
import { getStudentsByOrgName } from "../../controllers/admin/OrgStudentController.js";

const router = express.Router();

router.get("/by-org/:orgName", getStudentsByOrgName);

export default router;