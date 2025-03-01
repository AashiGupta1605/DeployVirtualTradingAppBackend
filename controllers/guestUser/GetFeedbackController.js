// const UserFeedback = require("../../models/FeedbackModAl");
import UserFeedback from "../../models/FeedbackModAl.js";

export const getUserFeedback = async (req, res) => {
    try {
        const {sortBy, order} = req.params
        
        // Convert 'increasing' or 'decreasing' to 1 or -1 for MongoDB sorting
        const sortOrder = order
        sortOrder = sortOrder === "increasing" ? 1 : -1;

        const feedbackData = await UserFeedback.find().sort({[sortBy]:sortOrder})

        res.status(200).json({ success: true, feedbackData });
    } 
    catch (error) {
        console.error('Error in geting user feedbacks data: ', error);
        res.status(500).json({ success: false, message: "Failed to get feedback data from database.", error });
    }
};