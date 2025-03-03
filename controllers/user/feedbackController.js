import Feedback from "../../models/FeedbackModel.js";
// import { organizationFeedbackValidationSchema } from "../../helpers/joiValidation.js";
import { buildDateQuery, buildSearchQuery } from "../../helpers/dataHandler.js";


// // organization user feedbacks - crud operations

export const organizationUsersFeedbackDisplay = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

    const searchQuery = buildSearchQuery(search);
    const dateQuery = buildDateQuery(startDate, endDate);

    // Fetch feedbacks with populated userId
    const feedbacks = await Feedback.find({
      addedby: orgName,
      isDeleted: false,
      ...dateQuery,
    })
      .populate({
        path: "userId",
        match: searchQuery, // Apply search query to the referenced User fields
        select: "name email mobile", // Select only necessary fields
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    // Filter out feedbacks where userId is null (no matching user)
    const filteredFeedbacks = feedbacks.filter((feedback) => feedback.userId !== null);

    // Count total feedbacks matching the search and date criteria
    const totalFeedbacks = await Feedback.countDocuments({
      addedby: orgName,
      isDeleted: false,
      ...dateQuery,
    }).populate({
      path: "userId",
      match: searchQuery,
    });

    res.status(200).json({
      feedbacks: filteredFeedbacks,
      totalPages: Math.ceil(totalFeedbacks / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching feedbacks by organization:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks." });
  }
};


export const organizationUsersFeedbackDelete = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback || feedback.isDeleted) {
      return res.json({ success: false, msg: "Feedback not found" });
    }

    // Soft delete the feedback
    feedback.isDeleted = true;
    feedback.updatedDate = Date.now();

    await feedback.save();

    res.status(200).json({ success: true, msg: "Feedback deleted successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};



// Update feedback status
export const updateUsersFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status value." });
    }

    // Find and update the feedback
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status, updatedDate: Date.now() },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, msg: "Feedback not found." });
    }

    res.status(200).json({ success: true, msg: "Feedback status updated successfully.", feedback });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({ success: false, msg: "Failed to update feedback status." });
  }
};


// organization feedbacks  - crud opeartions

// Register organization feedback
export const registerOrganizationFeedback = async (req, res) => {
  const { orgName, feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;

  try {
    const newFeedback = new Feedback({
      feedbackCategory,
      feedbackMessage,
      rating,
      recommend,
      suggestions,
      addedby: orgName, // Set the organization name
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
};

// Display organization feedback
export const displayOrganizationFeedback = async (req, res) => {
  const orgName = req.params.orgName;
  const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

  try {
    const searchQuery = buildSearchQuery(search);
    const dateQuery = buildDateQuery(startDate, endDate);

    const feedbacks = await Feedback.find({
      addedby: orgName,
      isDeleted: false,
      ...dateQuery,
      ...searchQuery,
    })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdDate: -1 });

    const totalFeedbacks = await Feedback.countDocuments({
      addedby: orgName,
      isDeleted: false,
      ...dateQuery,
      ...searchQuery,
    });

    res.status(200).json({
      feedbacks,
      totalPages: Math.ceil(totalFeedbacks / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching organization feedback:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};









// user code ---------------------------------------

import User from "../../models/UserModal.js";

// Create Feedback
export const createFeedback = async (req, res) => {
    try {
        const { userId, feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;
  
        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
  
        const newFeedback = new Feedback({
            userId,
            feedbackCategory,
            feedbackMessage,
            rating,
            recommend,
            suggestions
        });
  
        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  // Get All Feedbacks
  export const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ isDeleted: false }).populate("userId", "name email");
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  // Get Feedback by ID
  export const getFeedbackById = async (req, res) => {
    
      try {
        const { id } = req.params;
  
      const feedback = await Feedback.find({ userId: id }).populate("userId", "name email mobile"); // Populate user details
  
      if (!feedback.length) {
        return res.status(404).json({ message: "No feedback found" });
      }
  
      res.status(200).json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Internal server error" });
    }
    };
    
  
  // Update Feedback
  export const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFeedback = await Feedback.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedFeedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }
        res.status(200).json({ message: "Feedback updated successfully", feedback: updatedFeedback });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  // Soft Delete Feedback
  export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }
        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };