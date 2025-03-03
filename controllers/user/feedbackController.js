// controllers/admin/feedbackControllers.js
import Feedback from '../../models/FeedbackModAl.js';

// Feedback Controllers
export const getAllFeedbacks = async (req, res) => {
  try {
    const {
      category,
      rating,
      startDate,
      endDate,
      recommend,
      search
    } = req.query;

    let query = { isDeleted: false };

    // Apply filters if provided
    if (category && category !== 'all') {
      query.feedbackCategory = category;
    }

    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    if (recommend === 'true' || recommend === 'false') {
      query.recommend = recommend === 'true';
    }

    if (startDate && endDate) {
      query.createdDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (search) {
      // Get user IDs matching the search criteria
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
      
      const userIds = users.map(user => user._id);
      
      query.$or = [
        { userId: { $in: userIds } },
        { feedbackMessage: { $regex: search, $options: 'i' } }
      ];
    }

    const feedbacks = await Feedback.find(query)
      .populate('userId', 'name email mobile') // Populate user details
      .sort({ createdDate: -1 });

    // Calculate statistics
    const stats = {
      total: feedbacks.length,
      positive: feedbacks.filter(f => f.rating >= 4).length,
      negative: feedbacks.filter(f => f.rating <= 2).length,
      recommended: feedbacks.filter(f => f.recommend).length
    };

    res.status(200).json({
      success: true,
      data: feedbacks,
      stats
    });

  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
      error: error.message
    });
  }
};

// Get feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};


// Update feedback status (approve/reject)
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status,
          updatedDate: Date.now()
        } 
      },
      { 
        new: true,
        populate: {
          path: 'userId',
          select: 'name email'
        }
      }
    );

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Feedback status updated to ${status}`,
      data: updatedFeedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: error.message
    });
  }
};

// Soft delete feedback
export const softDeleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: true,
          updatedDate: Date.now()
        }
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
};

// Get feedback statistics
export const getFeedbackStats = async (req, res) => {
  try {
    const allFeedbacks = await Feedback.find({ isDeleted: false });

    const stats = {
      total: allFeedbacks.length,
      categoryDistribution: {},
      averageRating: 0,
      recommendationRate: 0
    };

    // Calculate statistics
    if (allFeedbacks.length > 0) {
      // Category distribution
      allFeedbacks.forEach(feedback => {
        stats.categoryDistribution[feedback.feedbackCategory] = 
          (stats.categoryDistribution[feedback.feedbackCategory] || 0) + 1;
      });

      // Average rating
      const totalRating = allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      stats.averageRating = (totalRating / allFeedbacks.length).toFixed(1);

      // Recommendation rate
      const recommended = allFeedbacks.filter(f => f.recommend).length;
      stats.recommendationRate = ((recommended / allFeedbacks.length) * 100).toFixed(1);
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: error.message
    });
  }
};

