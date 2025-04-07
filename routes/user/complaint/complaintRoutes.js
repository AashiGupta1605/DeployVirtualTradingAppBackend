import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getComplaintByUserId,
  updateComplaint,
  deleteComplaint,
  getAllComplaintsAdmin,
  getComplaintByIdAdmin,
  updateComplaintStatus,
  softDeleteComplaint,
  getComplaintStats
} from "../../../controllers/user/complaintController.js";
import userMiddleware from "../../../middlewares/userMiddleware.js";

const router = express.Router();

// Admin complaint routes (no middleware)
router.get('/admin', getAllComplaintsAdmin);
router.get('/admin/stats', getComplaintStats);
router.get('/admin/:id', getComplaintByIdAdmin);
router.patch('/admin/:id/status', updateComplaintStatus);
router.delete('/admin/:id', softDeleteComplaint);

router.post("/",userMiddleware, createComplaint);
router.get("/", userMiddleware, getAllComplaints);
router.get("/:id",userMiddleware, getComplaintByUserId);
router.put("/:id",userMiddleware, updateComplaint);
router.delete("/:id", userMiddleware ,deleteComplaint);



export default router;
