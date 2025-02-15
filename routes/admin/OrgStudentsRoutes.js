// routes/OrgStudentsRoutes.js
import express from "express";
import { getStudentsByOrgName } from "../../controllers/admin/OrgStudentController.js";

const router = express.Router();

// Route to fetch students by organization name
router.get("/by-org/:orgName", getStudentsByOrgName);

export default router;