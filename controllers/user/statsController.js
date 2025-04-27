// controllers/user/statsController.js
import User from "../../models/UserModal.js";
import Event from "../../models/EventModal.js";
import Feedback from "../../models/FeedbackModel.js";
import Complaint from "../../models/ComplaintModel.js";
import ContactUs from "../../models/ContactUsModal.js";
import EventRegistration from "../../models/EventRegistrationModal.js";
// Get user-specific stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = {
      total: 1, // Since it's individual user
      active: user.status ? 1 : 0,
      gender: user.gender || "Not specified",
      age: user.dob ? calculateAge(user.dob) : null,
      registrationDate: user.createdDate,
    };

    res.json({ stats, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's event stats
export const getEventStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const [total, upcoming, ongoing, completed] = await Promise.all([
      Event.countDocuments({ organizer: userId, isDeleted: false }),
      Event.countDocuments({
        organizer: userId,
        type: "upcoming",
        isDeleted: false,
      }),
      Event.countDocuments({
        organizer: userId,
        type: "ongoing",
        isDeleted: false,
      }),
      Event.countDocuments({
        organizer: userId,
        type: "completed",
        isDeleted: false,
      }),
    ]);

    res.json({ stats: { total, upcoming, ongoing, completed } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's feedback stats
export const getFeedbackStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const feedbacks = await Feedback.find({ userId, isDeleted: false });

    const total = feedbacks.length;
    const averageRating =
      total > 0 ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / total : 0;
    const recommendationRate =
      total > 0
        ? (feedbacks.filter((fb) => fb.recommend).length / total) * 100
        : 0;

    const stats = {
      total,
      averageRating,
      recommendationRate,
      positive: feedbacks.filter((fb) => fb.rating >= 4).length,
      negative: feedbacks.filter((fb) => fb.rating <= 2).length,
    };

    res.json({ stats, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's complaint stats
export const getComplaintStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const [total, pending, solved] = await Promise.all([
      Complaint.countDocuments({ userId, isDeleted: false }),
      Complaint.countDocuments({ userId, status: "pending", isDeleted: false }),
      Complaint.countDocuments({ userId, status: "solved", isDeleted: false }),
    ]);

    const stats = {
      total,
      pending,
      solved,
      resolutionRate: total > 0 ? (solved / total) * 100 : 0,
    };

    res.json({ stats, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's query stats
export const getQueryStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const [total, responded] = await Promise.all([
      ContactUs.countDocuments({ userId, isDeleted: false }),
      ContactUs.countDocuments({ userId, responded: true, isDeleted: false }),
    ]);

    const stats = {
      total,
      responded,
      responseRate: total > 0 ? (responded / total) * 100 : 0,
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/user/statsController.js
import SubscriptionPlan from "../../models/SubscriptionPlanModal.js";
// ... other imports ...

// Add this new controller function
export const getSubscriptionStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const subscription = await SubscriptionPlan.findOne({
      userId,
      isDeleted: false,
      status: "Active",
    }).sort({ endDate: -1 });

    if (!subscription) {
      return res.json({
        stats: {
          hasSubscription: false,
          message: "No active subscription found",
        },
      });
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const stats = {
      hasSubscription: true,
      plan: subscription.plan,
      planPrice: subscription.planPrice,
      vertualAmount: subscription.vertualAmount,
      duration: subscription.duration,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      status: subscription.status,
      paymentStatus: subscription.paymentStatus,
    };

    res.json({ stats, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import NiftyData from "../../models/NiftyDataModal.js";
import Nifty500Data from "../../models/Nifty500DataModal.js";
import NiftyETFData from "../../models/StockModal.js";

export const getStockStats = async (req, res) => {
  try {
    // Get latest records from each collection
    const [latestNifty50, latestNifty500, latestETF] = await Promise.all([
      NiftyData.findOne().sort({ fetchTime: -1 }).lean(),
      Nifty500Data.findOne().sort({ fetchTime: -1 }).lean(),
      NiftyETFData.findOne().sort({ fetchTime: -1 }).lean(),
    ]);

    // Calculate counts
    const totalNifty50 = latestNifty50?.stocks?.length || 0;
    const totalNifty500 = latestNifty500?.stocks?.length || 0;
    const totalETF = latestETF?.stocks?.length || 0;
    const totalStocks = totalNifty50 + totalNifty500 + totalETF;

    // Get most recent fetch times
    const lastUpdated = {
      nifty50: latestNifty50?.fetchTime,
      nifty500: latestNifty500?.fetchTime,
      etf: latestETF?.fetchTime,
    };

    // Prepare response

    res.status(200).json({
      success: true,
      stats: {
        all: totalStocks,
        nifty50: totalNifty50,
        nifty500: totalNifty500,
        etf: totalETF,
      },
      message: "fetched stock data successfully",
    });
  } catch (error) {
    console.error("Error fetching stock stats:", error);
    res.status(500).json({
      message: "Failed to fetch stock statistics",
      error: error.message,
    });
  }
};

// Get focused certificate stats for user
export const getCertificateStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get all certificates with basic event details
    const certificates = await EventRegistration.find({
      userId,
      isDeleted: false,
      status: "Completed",
      certificateId: { $exists: true, $ne: null },
    })
      .populate({
        path: "eventId",
        select: "title type",
      })
      .sort({ updatedAt: -1 }) // Sort by newest first
      .lean();

    const totalCertificates = certificates.length;

    // Recent certificates (last 3)
    const recentCertificates = certificates.slice(0, 3).map((cert) => ({
      id: cert.certificateId,
      eventTitle: cert.eventId?.title || "Unknown Event",
      eventType: cert.eventId?.type || "Unknown",
      date: cert.updatedAt,
    }));

    // Certificates with rewards
    const certificatesWithRewards = certificates.filter(
      (cert) => cert.rewardReceived
    ).length;

    // Certificates by type
    const certificatesByType = certificates.reduce((acc, cert) => {
      const type = cert.eventId?.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalCertificates,
      recentCertificates,
      certificatesWithRewards,
      certificatesByType
    };

    res.status(200).json({
      success: true,
      stats,
      message: "fetched certificate data successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getParticipationStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const [totalParticipations, completedEvents, upcomingEvents, ongoingEvents, wonEvents] = await Promise.all([
      EventRegistration.countDocuments({ userId, isDeleted: false }),
      EventRegistration.countDocuments({ 
        userId, 
        isDeleted: false,
        status: 'Completed'
      }),
      EventRegistration.countDocuments({ 
        userId, 
        isDeleted: false,
        status: 'Registered',
        eventId: { $in: await Event.find({ type: 'upcoming', isDeleted: false }).distinct('_id') }
      }),
      EventRegistration.countDocuments({ 
        userId, 
        isDeleted: false,
        status: 'Registered',
        eventId: { $in: await Event.find({ type: 'ongoing', isDeleted: false }).distinct('_id') }
  }),
      EventRegistration.countDocuments({ 
        userId, 
        isDeleted: false,
        position: { $exists: true, $ne: null },
        rewardReceived: true
      })
    ]);

    const stats = {
      totalParticipations,
      completedEvents,
      upcomingEvents,
      ongoingEvents,
      wonEvents,
      winRate: totalParticipations > 0 ? (wonEvents / totalParticipations * 100) : 0,
      completionRate: totalParticipations > 0 ? (completedEvents / totalParticipations * 100) : 0
    };

    res.status(200).json({ stats, success: true, message:"events data fetch successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update your existing exports
// export default {
//   getUserStats,
//   getEventStats,
//   getFeedbackStats,
//   getComplaintStats,
//   getQueryStats,
//   getSubscriptionStats // Add this
// };

// Helper function to calculate age
function calculateAge(dob) {
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
