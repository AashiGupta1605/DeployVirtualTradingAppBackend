import express from "express";
import { displayOrganizationFeedback, organizationUsersFeedbackDelete, organizationUsersFeedbackDisplay, registerOrganizationFeedback, updateUsersFeedbackStatus, createFeedback, deleteFeedback, getAllFeedbacks, getFeedbackById, updateFeedback,
    getFeedbackByIdAdmin,
    updateFeedbackStatus,
    softDeleteFeedback,
    getFeedbackStats,  
    getAllFeedbackAdmin,
    updateOrganizationFeedback,
    deleteOrganizationFeedback,
    updateOrganizationUsersFeedback} from "../../../controllers/user/feedbackController.js";
import userMiddleware from "../../../middlewares/userMiddleware.js";
const router = express.Router();


// Admin routes (no middleware)
router.get('/admin', getAllFeedbackAdmin); // Removed userMiddleware
router.get('/admin/stats', getFeedbackStats);
router.get('/admin/:id', getFeedbackByIdAdmin);
router.patch('/admin/:id/status', updateFeedbackStatus);
router.delete('/admin/:id', softDeleteFeedback);

// organization user feedbacks
router.get("/:orgName/users/feedbacks", organizationUsersFeedbackDisplay);
router.delete("/delete/:id", organizationUsersFeedbackDelete);
router.put("/update/feedbacks/:id", updateOrganizationUsersFeedback);
router.put("/update/status/:id", updateUsersFeedbackStatus);

// organization feedbacks
router.post("/register", registerOrganizationFeedback);
router.get("/:orgName/feedback", displayOrganizationFeedback); //orgname
// router.get("/:organizationId/feedback", displayOrganizationFeedback); //orgid

router.put("/update/:feedbackId", updateOrganizationFeedback); // Update feedback route
router.delete("/delete/:feedbackId", deleteOrganizationFeedback); 

//user feedback routes 
router.post("/", userMiddleware, createFeedback);
router.get("/", userMiddleware, getAllFeedbacks);
router.get("/:id", userMiddleware, getFeedbackById);
router.put("/:id", userMiddleware, updateFeedback);
router.delete("/:id", userMiddleware, deleteFeedback);


export default router;