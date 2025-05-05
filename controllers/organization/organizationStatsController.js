// import {
//     SERVER_ERROR,
//   } from "../../helpers/messages.js";
//   import User from "../../models/UserModal.js";
//   import Event from "../../models/EventModal.js";
//   import Feedback from "../../models/FeedbackModel.js";
//   import Complaint from "../../models/ComplaintModel.js";
//   import moment from "moment";
  
//   export const getOrgUserStats = async (req, res) => {
//     try {
//       const orgId = req.user.organizationId; // Assuming organizationId is stored in JWT
//       const [
//         totalCount,
//         maleCount,
//         femaleCount,
//         activeCount,
//         deactiveCount,
//         usersForAge,
//       ] = await Promise.all([
//         User.countDocuments({ addedby: orgId, isDeleted: false }),
//         User.countDocuments({ addedby: orgId, gender: "Male", isDeleted: false }),
//         User.countDocuments({ addedby: orgId, gender: "Female", isDeleted: false }),
//         User.countDocuments({ addedby: orgId, status: true, isDeleted: false }),
//         User.countDocuments({ addedby: orgId, status: false, isDeleted: false }),
//         User.find({ addedby: orgId, isDeleted: false }, "dob"),
//       ]);
  
//       const totalAge = usersForAge.reduce((sum, user) => {
//         return sum + moment().diff(user.dob, "years");
//       }, 0);
//       const averageAge = (totalAge / (usersForAge.length || 1)).toFixed(2);
  
//       res.status(200).json({
//         success: true,
//         stats: {
//           total: totalCount,
//           male: maleCount,
//           female: femaleCount,
//           active: activeCount,
//           deactive: deactiveCount,
//           averageAge: isNaN(averageAge) ? 0 : averageAge,
//         },
//         message: "Organization user stats fetched successfully",
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({
//         success: false,
//         message: SERVER_ERROR,
//         error: error.message,
//       });
//     }
//   };
  
//   export const getOrgEventStats = async (req, res) => {
//     try {
//       const orgId = req.user.organizationId;
      
//       const [totalEvents, upcomingEvents, completedEvents, ongoingEvents] =
//         await Promise.all([
//           Event.countDocuments({ organizationId: orgId, isDeleted: false }),
//           Event.countDocuments({ organizationId: orgId, isDeleted: false, type: "upcoming" }),
//           Event.countDocuments({ organizationId: orgId, isDeleted: false, type: "completed" }),
//           Event.countDocuments({ organizationId: orgId, isDeleted: false, type: "ongoing" }),
//         ]);
  
//       res.status(200).json({
//         success: true,
//         stats: {
//           total: totalEvents,
//           upcoming: upcomingEvents,
//           completed: completedEvents,
//           ongoing: ongoingEvents,
//         },
//         message: "Organization event stats fetched successfully",
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({
//         success: false,
//         message: SERVER_ERROR,
//         error: error.message,
//       });
//     }
//   };
  
//   export const getOrgFeedbackStats = async (req, res) => {
//     try {
//       const orgId = req.user.organizationId;
      
//       const [
//         totalFeedbacks,
//         averageRating,
//         recommendedCount,
//         ratingDistribution,
//         recentFeedbacks
//       ] = await Promise.all([
//         Feedback.countDocuments({ organizationId: orgId, isDeleted: false }),
//         Feedback.aggregate([
//           { $match: { organizationId: orgId, isDeleted: false } },
//           { $group: { _id: null, averageRating: { $avg: "$rating" } } }
//         ]),
//         Feedback.countDocuments({ organizationId: orgId, isDeleted: false, recommend: true }),
//         Feedback.aggregate([
//           { $match: { organizationId: orgId, isDeleted: false } },
//           { $group: { _id: "$rating", count: { $sum: 1 } } },
//           { $sort: { _id: 1 } }
//         ]),
//         Feedback.find({ organizationId: orgId, isDeleted: false })
//           .sort({ createdDate: -1 })
//           .limit(5)
//           .select('feedbackCategory rating recommend feedbackMessage createdDate')
//       ]);
  
//       const avgRating = averageRating[0]?.averageRating || 0;
//       const recommendationRate = totalFeedbacks > 0 
//         ? (recommendedCount / totalFeedbacks) * 100 
//         : 0;
  
//       // Format rating distribution
//       const formattedRatingDistribution = Array(5).fill(0);
//       ratingDistribution.forEach(item => {
//         formattedRatingDistribution[item._id - 1] = item.count;
//       });
  
//       res.status(200).json({
//         success: true,
//         stats: {
//           total: totalFeedbacks,
//           averageRating: avgRating.toFixed(2),
//           recommendationRate: recommendationRate.toFixed(2),
//           ratingDistribution: formattedRatingDistribution,
//           recentFeedbacks,
//         },
//         message: "Organization feedback stats fetched successfully",
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({
//         success: false,
//         message: SERVER_ERROR,
//         error: error.message,
//       });
//     }
//   };
  
//   export const getOrgComplaintStats = async (req, res) => {
//     try {
//       const orgId = req.user.organizationId;
      
//       const [total, pending, resolved, recent] = await Promise.all([
//         Complaint.countDocuments({ organizationId: orgId, isDeleted: false }),
//         Complaint.countDocuments({ organizationId: orgId, status: "pending", isDeleted: false }),
//         Complaint.countDocuments({ organizationId: orgId, status: "resolved", isDeleted: false }),
//         Complaint.find({ organizationId: orgId, isDeleted: false })
//           .sort({ createdDate: -1 })
//           .limit(5)
//           .select('title status createdDate')
//       ]);
  
//       res.status(200).json({
//         success: true,
//         stats: {
//           total,
//           pending,
//           resolved,
//           resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0,
//           recentComplaints: recent
//         },
//         message: "Organization complaint stats fetched successfully",
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({
//         success: false,
//         message: SERVER_ERROR,
//         error: error.message,
//       });
//     }
//   };




import {
  SERVER_ERROR,
} from "../../helpers/messages.js";
import User from "../../models/UserModal.js";
import Event from "../../models/EventModal.js";
import Feedback from "../../models/FeedbackModel.js";
import Complaint from "../../models/ComplaintModel.js";
import OrgRegister from "../../models/OrgRegisterModal.js";
import ContactUs from "../../models/ContactUsModal.js";
import moment from "moment";

// export const getOrgUserStats = async (req, res) => {
//   try {
//     const orgName = req.params.orgName;
//     console.log(orgName);
    
//     // First get the organization ID from the name
//     const org = await OrgRegister.findOne({ name:orgName, isDeleted: false });
//     if (!org) {
//       return res.status(404).json({
//         success: false,
//         message: "Organization not found",
//       });
//     }

//     const [
//       totalCount,
//       maleCount,
//       femaleCount,
//       activeCount,
//       deactiveCount,
//       usersForAge,
//     ] = await Promise.all([
//     User.countDocuments({ addedby: orgName, isDeleted: false }),
//     User.countDocuments({ addedby: orgName, gender: "Male", isDeleted: false }),
//     User.countDocuments({ addedby: orgName, gender: "Female", isDeleted: false }),
//     User.countDocuments({ addedby: orgName, status: "approved", isDeleted: false }),
//     User.countDocuments({ addedby: orgName, status: "not approved", isDeleted: false }),
//     User.find({ addedby: orgName, isDeleted: false }, "dob"),
//     ]);

//     const totalAge = usersForAge.reduce((sum, user) => {
//       return sum + moment().diff(user.dob, "years");
//     }, 0);
//     const averageAge = (totalAge / (usersForAge.length || 1)).toFixed(2);

//     res.status(200).json({
//       success: true,
//       stats: {
//         total: totalCount,
//         male: maleCount,
//         female: femaleCount,
//         active: activeCount,
//         deactive: deactiveCount,
//         averageAge: isNaN(averageAge) ? 0 : averageAge,
//       },
//       message: "Organization user stats fetched successfully",
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       success: false,
//       message: SERVER_ERROR,
//       error: error.message,
//     });
//   }
// };

export const getOrgUserStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    console.log(orgName);
    
    // First get the organization ID from the name
    const org = await OrgRegister.findOne({ name: orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const [
      totalCount,
      maleCount,
      femaleCount,
      activeCount,
      deactiveCount,
      usersForAge,
    ] = await Promise.all([
      User.countDocuments({ addedby: orgName, isDeleted: false }),
      User.countDocuments({ addedby: orgName, gender: "Male", isDeleted: false }),
      User.countDocuments({ addedby: orgName, gender: "Female", isDeleted: false }),
      User.countDocuments({ addedby: orgName, isDeleted: false }), // Changed to lowercase
      User.countDocuments({ addedby: orgName, status: "not approved", isDeleted: false }), // Changed to lowercase
      User.find({ addedby: orgName, isDeleted: false }, "dob"),
  
    ]);

    console.log(`DB Query Results - Total: ${totalCount}, Male: ${maleCount}, Female: ${femaleCount}, Active: ${activeCount}, Deactive: ${deactiveCount}, Users for Age Calc: ${usersForAge.length}`);

    const totalAge = usersForAge.reduce((sum, user) => {
      return sum + moment().diff(user.dob, "years");
    }, 0);
    const averageAge = (totalAge / (usersForAge.length || 1)).toFixed(2);

    res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        male: maleCount,
        female: femaleCount,
        active: activeCount,
        deactive: deactiveCount,
        averageAge: isNaN(averageAge) ? 0 : averageAge,
      },
      message: "Organization user stats fetched successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};

export const getOrgEventStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    
    const org = await OrgRegister.findOne({ name:orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const [totalEvents, upcomingEvents, completedEvents, ongoingEvents] =
      await Promise.all([
        Event.countDocuments({ isDeleted: false }),
        Event.countDocuments({ isDeleted: false, type: "upcoming" }),
        Event.countDocuments({ isDeleted: false, type: "completed" }),
        Event.countDocuments({ isDeleted: false, type: "ongoing" }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalEvents,
        upcoming: upcomingEvents,
        completed: completedEvents,
        ongoing: ongoingEvents,
      },
      message: "Organization event stats fetched successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};

export const getOrgFeedbackStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    
    const org = await OrgRegister.findOne({ name:orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const [
      totalFeedbacks,
      averageRating,
      recommendedCount,
      ratingDistribution,
      recentFeedbacks
    ] = await Promise.all([
      Feedback.countDocuments({ addedby: orgName, isDeleted: false }),
      Feedback.aggregate([
        { $match: { addedby: orgName, isDeleted: false } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }
      ]),
      Feedback.countDocuments({ addedby: orgName, isDeleted: false, recommend: true }),
      Feedback.aggregate([
        { $match: { addedby: orgName, isDeleted: false } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Feedback.find({ addedby: orgName, isDeleted: false })
        .sort({ createdDate: -1 })
        .limit(5)
        .select('feedbackCategory rating recommend feedbackMessage createdDate')
    ]);

    const avgRating = averageRating[0]?.averageRating || 0;
    const recommendationRate = totalFeedbacks > 0 
      ? (recommendedCount / totalFeedbacks) * 100 
      : 0;

    // Format rating distribution
    const formattedRatingDistribution = Array(5).fill(0);
    ratingDistribution.forEach(item => {
      formattedRatingDistribution[item._id - 1] = item.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalFeedbacks,
        averageRating: avgRating.toFixed(2),
        recommendationRate: recommendationRate.toFixed(2),
        ratingDistribution: formattedRatingDistribution,
        recentFeedbacks,
      },
      message: "Organization feedback stats fetched successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};

export const getOrgComplaintStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    
    const org = await OrgRegister.findOne({ name:orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const [total, pending, resolved, recent] = await Promise.all([
      Complaint.countDocuments({   complaintType: "organization", isDeleted: false }),
      Complaint.countDocuments({   complaintType: "organization", status: "pending", isDeleted: false }),
      Complaint.countDocuments({   complaintType: "organization", status: "resolved", isDeleted: false }),
      Complaint.find({   complaintType: "user", isDeleted: false })
        .sort({ createdDate: -1 })
        .limit(5)
        .select('title status createdDate')
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        resolved,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0,
        recentComplaints: recent
      },
      message: "Organization complaint stats fetched successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};

export const getOrgUserComplaintStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;

    // 1. Verify organization exists
    const org = await OrgRegister.findOne({ name: orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // 2. Get all user IDs for this organization
    const orgUsers = await User.find({
      addedby: orgName,
      isDeleted: false
    }).select('_id'); // Select only IDs for efficiency

    const userIds = orgUsers.map(user => user._id);

    // 3. Handle case where organization has no users
    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          total: 0,
          pending: 0,
          resolved: 0, // Use 'resolved' for consistency if frontend expects it
          resolutionRate: 0,
          recentUserComplaints: [],
        },
        message: "No users found for this organization.",
      });
    }

    // 4. Query Complaint collection for complaints by these users
    const [
        totalUserComplaints,
        pendingUserComplaints,
        resolvedUserComplaints, // Mapped from 'solved' status
        recentUserComplaintsData
    ] = await Promise.all([
      // Total complaints by org users
      Complaint.countDocuments({
        userId: { $in: userIds },
        isDeleted: false
      }),
      // Pending complaints by org users
      Complaint.countDocuments({
        userId: { $in: userIds },
        status: "pending",
        isDeleted: false
      }),
      // Solved complaints by org users
      Complaint.countDocuments({
        userId: { $in: userIds },
        status: "solved", // Use the enum value from your model
        isDeleted: false
      }),
      // Recent complaints by org users
      Complaint.find({
        userId: { $in: userIds },
        isDeleted: false
      })
        .sort({ createdDate: -1 })
        .limit(5)
        // Select relevant fields and populate user name/email for context
        .select('category status createdDate userId complaintMessage')
        .populate('userId', 'name email') // Populate user details
    ]);

    // 5. Calculate resolution rate
    const resolutionRate = totalUserComplaints > 0
      ? ((resolvedUserComplaints / totalUserComplaints) * 100).toFixed(2)
      : 0;

    // 6. Send the response
    res.status(200).json({
      success: true,
      stats: {
        total: totalUserComplaints,
        pending: pendingUserComplaints,
        resolved: resolvedUserComplaints, // Use 'resolved' key if preferred for frontend
        resolutionRate: parseFloat(resolutionRate), // Ensure number format
        recentUserComplaints: recentUserComplaintsData, // Renamed for clarity
      },
      message: "Organization user complaint stats fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching org user complaint stats:", error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};

export const getOrgUserFeedbackStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    
    // Verify organization exists
    const org = await OrgRegister.findOne({ name: orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Get all users for this organization
    const orgUsers = await User.find({ 
      addedby: orgName, 
      isDeleted: false 
    }).select('_id');

    const userIds = orgUsers.map(user => user._id);

    const [
      totalFeedbacks,
      averageRating,
      recommendedCount,
      ratingDistribution,
      feedbackByUser,
      recentFeedbacks
    ] = await Promise.all([
      // Total feedbacks for organization users
      Feedback.countDocuments({ 
        userId: { $in: userIds },
        isDeleted: false 
      }),
      
      // Average rating for organization users
      Feedback.aggregate([
        { 
          $match: { 
            userId: { $in: userIds },
            isDeleted: false 
          } 
        },
        { 
          $group: { 
            _id: null, 
            averageRating: { $avg: "$rating" } 
          } 
        }
      ]),
      
      // Recommended feedbacks count
      Feedback.countDocuments({ 
        userId: { $in: userIds },
        isDeleted: false,
        recommend: true 
      }),
      
      // Rating distribution
      Feedback.aggregate([
        { 
          $match: { 
            userId: { $in: userIds },
            isDeleted: false 
          } 
        },
        { 
          $group: { 
            _id: "$rating", 
            count: { $sum: 1 } 
          } 
        },
        { 
          $sort: { _id: 1 } 
        }
      ]),
      
      // Feedback count per user
      Feedback.aggregate([
        { 
          $match: { 
            userId: { $in: userIds },
            isDeleted: false 
          } 
        },
        { 
          $group: { 
            _id: "$userId", 
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" }
          } 
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            userName: "$user.name",
            userEmail: "$user.email",
            feedbackCount: "$count",
            averageRating: "$avgRating"
          }
        }
      ]),
      
      // Recent feedbacks
      Feedback.find({ 
        userId: { $in: userIds },
        isDeleted: false 
      })
        .sort({ createdDate: -1 })
        .limit(5)
        .select('feedbackCategory rating recommend feedbackMessage createdDate userId')
        .populate('userId', 'name email')
    ]);

    const avgRating = averageRating[0]?.averageRating || 0;
    const recommendationRate = totalFeedbacks > 0 
      ? (recommendedCount / totalFeedbacks) * 100 
      : 0;

    // Format rating distribution
    const formattedRatingDistribution = Array(5).fill(0);
    ratingDistribution.forEach(item => {
      formattedRatingDistribution[item._id - 1] = item.count;
    });

    // Calculate feedback participation rate
    const totalUsers = orgUsers.length;
    const usersWithFeedback = await Feedback.distinct('userId', { 
      userId: { $in: userIds },
      isDeleted: false 
    });
    const participationRate = totalUsers > 0 
      ? ((usersWithFeedback.length / totalUsers) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        total: totalFeedbacks,
        averageRating: avgRating.toFixed(2),
        recommendationRate: recommendationRate.toFixed(2),
        participationRate,
        ratingDistribution: formattedRatingDistribution,
        topFeedbackUsers: feedbackByUser,
        recentFeedbacks,
      },
      message: "Organization user feedback stats fetched successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};





export const getOrgUserQueryStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    
    // Verify organization exists
    const org = await OrgRegister.findOne({ name: orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Get all users for this organization
    const orgUsers = await User.find({ 
      addedby: orgName, 
      isDeleted: false 
    }).select('_id email name');

    const userIds = orgUsers.map(user => user._id);
    const userEmails = orgUsers.map(user => user.email);

    const [
      totalQueries,
      queriesByType,
      recentQueries,
      respondedQueries
    ] = await Promise.all([
      // Total queries count
      ContactUs.countDocuments({ 
        email: { $in: userEmails },
        isDeleted: false 
      }),
      
      // Queries grouped by type
      ContactUs.aggregate([
        { 
          $match: { 
            email: { $in: userEmails },
            isDeleted: false 
          } 
        },
        { 
          $group: { 
            _id: "$type", 
            count: { $sum: 1 } 
          } 
        },
        {
          $project: {
            type: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]),
      
      // Recent queries
      ContactUs.find({ 
        email: { $in: userEmails },
        isDeleted: false 
      })
        .sort({ createDate: -1 })
        .limit(5)
        .select('name email type desc createDate responded'),
      
      // Responded queries count
      ContactUs.countDocuments({ 
        email: { $in: userEmails },
        isDeleted: false,
        responded: true 
      })
    ]);

    // Calculate response rate
    const responseRate = totalQueries > 0 
      ? ((respondedQueries / totalQueries) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        total: totalQueries,
        responseRate,
        queriesByType,
        recentQueries
      },
      message: "Organization user query stats fetched successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
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
      message:"fetched stock data successfully"
    });
  } catch (error) {
    console.error("Error fetching stock stats:", error);
    res.status(500).json({
      message: "Failed to fetch stock statistics",
      error: error.message,
    });
  }
};



import galleryData from '../../models/EventsGalleryModal.js';

export const getGalleryStats = async (req, res) => {
  try {
    // Get all counts in parallel for better performance
    const [total, active, deleted, byCategory,  totalCategories, totalPhotos] = await Promise.all([
      galleryData.countDocuments({}),
      galleryData.countDocuments({ isDeleted: false }),
      galleryData.countDocuments({ isDeleted: true }),
      galleryData.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$categoryName", count: { $sum: 1 } } }
      ]),
      galleryData.distinct("categoryName").then(categories => categories.length),
      galleryData.distinct("photo").then(categories => categories.length),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,          // Total gallery items (including deleted)
        active,         // Currently active items
        deleted,        // Soft-deleted items
        byCategory ,
        totalCategories ,
        totalPhotos      // Count of active items by category
      },
      message: "Gallery statistics fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching gallery stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gallery statistics",
      error: error.message
    });
  }
};








// controllers/organization/organizationStatsController.js

// Make sure these imports are present at the top
// Import your Transaction model (adjust path if necessary)
import Transaction from "../../models/TransactionModal.js";
import EventRegistration from "../../models/EventRegistrationModal.js"; // Keep if needed for other stats

// ... (keep existing controller functions like getOrgUserStats, getOrgEventStats, etc.)
// ... (keep getOrgUserEventParticipationStats from the previous answer)

/**
 * @desc    Get total transaction count for users of a specific organization
 * @route   GET /api/organization/:orgName/stats/trading  (Route path can remain the same)
 * @access  Private/Admin
 */
export const getOrgUserTradingStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;

    // 1. Verify organization exists
    const org = await OrgRegister.findOne({ name: orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // 2. Get all user IDs for this organization
    const orgUsers = await User.find({
      addedby: orgName,
      isDeleted: false
    }).select('_id'); // Select only IDs for efficiency

    const userIds = orgUsers.map(user => user._id);

    // 3. Handle case where organization has no users
    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalTrades: 0, // Keep the key 'totalTrades' for consistency in frontend
        },
        message: "No users found for this organization.",
      });
    }

    // 4. Count total transactions made by these users using the Transaction model
    const totalTransactions = await Transaction.countDocuments({
      userId: { $in: userIds },
      // Add other filters if needed, e.g., status: 'completed'
      // status: 'completed'
      // No isDeleted field in the provided Transaction model, so omit it unless added later
    });

    // 5. Send the response
    res.status(200).json({
      success: true,
      stats: {
        totalTrades: totalTransactions, // Use the calculated count
      },
      message: "Organization user transaction stats fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching org user transaction stats:", error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};

// ... (keep other existing controller functions like getStockStats, getGalleryStats, etc.)

export const getOrgUserEventParticipationStats = async (req, res) => {
  try {
    const orgName = req.params.orgName;

    // Verify organization exists
    const org = await OrgRegister.findOne({ name: orgName, isDeleted: false });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Get all user IDs for this organization
    const orgUsers = await User.find({
      addedby: orgName,
      isDeleted: false
    }).select('_id'); // Only select the _id for efficiency

    const userIds = orgUsers.map(user => user._id);

    if (userIds.length === 0) {
      // No users in the organization, return zero stats
      return res.status(200).json({
        success: true,
        stats: {
          participatingUsers: 0,
          participationRate: 0,
          certificatesIssued: 0,
        },
        message: "No users found for this organization.",
      });
    }

    // Perform calculations in parallel
    const [participatingUserIds, certificatesCount] = await Promise.all([
      // Find unique user IDs who have registered or completed an event
      EventRegistration.distinct('userId', {
        userId: { $in: userIds },
        status: { $in: ['Registered', 'Completed'] } // Consider 'Registered' or 'Completed' as participation
        // Add isDeleted: false if your EventRegistration model has it
      }),
      // Count registrations with a certificate ID for these users
      EventRegistration.countDocuments({
        userId: { $in: userIds },
        certificateId: { $exists: true, $ne: null } // Check if certificateId exists and is not null
        // Add isDeleted: false if your EventRegistration model has it
      })
    ]);

    const participatingUsersCount = participatingUserIds.length;
    const totalOrgUsers = orgUsers.length;
    const participationRate = totalOrgUsers > 0
      ? ((participatingUsersCount / totalOrgUsers) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        participatingUsers: participatingUsersCount,
        participationRate: parseFloat(participationRate), // Ensure it's a number
        certificatesIssued: certificatesCount,
      },
      message: "Organization event participation stats fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching org event participation stats:", error.message);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};
