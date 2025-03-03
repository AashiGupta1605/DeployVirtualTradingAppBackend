import express from "express";
import { displayOrganizationFeedback, organizationUsersFeedbackDelete, organizationUsersFeedbackDisplay, registerOrganizationFeedback, updateUsersFeedbackStatus, createFeedback, deleteFeedback, getAllFeedbacks, getFeedbackById, updateFeedback,
    getFeedbackByIdAdmin,
    updateFeedbackStatus,
    softDeleteFeedback,
    getFeedbackStats,  
    getAllFeedbackAdmin} from "../../controllers/user/feedbackController.js";
import userMiddleware from "../../middlewares/userMiddleware.js";
const router = express.Router();


// organization user feedbacks
router.get("/:orgName/users/feedbacks", organizationUsersFeedbackDisplay);
router.delete("/delete/feedbacks/:id", organizationUsersFeedbackDelete);
router.put("/update/feedbacks/:id", updateUsersFeedbackStatus);


// user feedabcks routes

//feedback routes 
router.post("/feedback", userMiddleware, createFeedback);
router.get("/feedbacks", userMiddleware, getAllFeedbacks);
router.get("/feedback/:id", userMiddleware, getFeedbackById);
router.put("/feedback/:id", userMiddleware, updateFeedback);
router.delete("/feedback/:id", userMiddleware, deleteFeedback);



// organization feedbacks

router.post("/feedback/register", registerOrganizationFeedback);
router.get("/:orgName/feedback", displayOrganizationFeedback);






// admin routes

router.get('/', getAllFeedbackAdmin);
router.get('/stats', getFeedbackStats);
router.get('/:id', getFeedbackByIdAdmin);
router.patch('/:id/status', updateFeedbackStatus);
router.delete('/:id', softDeleteFeedback);


export default router;