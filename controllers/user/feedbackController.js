import Feedback from "../../models/FeedbackModAl.js";

export const getUserFeedback = async (req, res) => {
    try {
        const {category, sortBy, order} = req.params
        
        // Convert 'increasing' or 'decreasing' to 1 or -1 for MongoDB sorting
        const sortOrder = order === "increasing" ? 1 : -1;

        const filter = category && category !== "undefined" ? { feedbackCategory: category } : {};
        
        const feedbackData = await Feedback.find(filter).sort({[sortBy]:sortOrder})

        res.status(200).json({ success: true, feedbackData });
    } 
    catch (error) {
        console.error('Error in geting user feedbacks data: ', error);
        res.status(500).json({ success: false, message: "Failed to get feedback data from database.", error });
    }
};

export const getAllFeedback = async(req,res)=>{
    try{
        const feedbackData = await Feedback.find()
        res.status(200).json({ success: true, feedbackData });
    }
    catch(error){
        console.log('Error in geting user feedbacks data: ', error);
        res.status(500).json({ success: false, message: "Failed to get feedback data from database.", error });
    }
};