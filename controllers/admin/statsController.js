// import { ORG_ACTIVE_USER_FETCHED_SUCCESS, ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS, ORG_DEACTIVE_USER_FETCHED_SUCCESS, ORG_FEMALE_USER_FETCHED_SUCCESS, ORG_MALE_USER_FETCHED_SUCCESS, ORG_NEW_USER_FETCHED_SUCCESS, ORG_TOTAL_USER_FETCHED_SUCCESS, SERVER_ERROR } from '../../helpers/messages.js';
// import OrgRegister from '../../models/OrgRegisterModal.js';
// import User from "../../models/UserModal.js";

// // USER STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------

// export const totalUsers = async (req, res) => {

//   try {
//     const count = await User.countDocuments({ isDeleted: false });
//     res.status(200).json({ success: true, count });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total user fetched succesffully"  });
//   }
// };

// export const maleUsers = async (req, res) => {

//   try {
//     const maleUsersCount = await User.countDocuments({
//       gender: "Male",
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: maleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching male users"  });
//   }
// };

// export const femaleUsers = async (req, res) => {

//   try {
//     const femaleUsersCount = await User.countDocuments({
//       gender: "Female",
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: femaleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching female users"  });
//   }
// };

// export const activeUsers = async (req, res) => {
//   try {
//     const activeUsersCount = await User.countDocuments({
//       status: true,
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: activeUsersCount, msg:"fetched active user successfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg });
//   }
// };

// export const deactiveUsers = async (req, res) => {

//   try {
//     const deactiveUsersCount = await User.countDocuments({
//       status: false,
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: deactiveUsersCount, msg:"fetched inactive user successfully" }  );
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

// export const averageUserAge = async (req, res) => {
//   try {
//     const users = await User.find({ isDeleted: false }, 'dob');
//     const totalAge = users.reduce((sum, user) => {
//       const age = moment().diff(user.dob, 'years');
//       return sum + age;
//     }, 0);
//     const averageAge = totalAge / users.length;
//     res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:"average age fetch succesfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg });
//   }
// };

// // ORGANIZATION STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------

// export const totalOrganizations = async (req, res) => {

//   try {
//     const count = await OrgRegister.countDocuments({ isDeleted: false });
//     res.status(200).json({ success: true, count });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total organization count fetched succesffully"  });
//   }
// };

// export const organizationTotalUsers = async (req, res) => {
//     try {
//       // Count users that are not deleted and were added by organizations (not self-registered)
//       const count = await User.countDocuments({
//         isDeleted: false,
//         addedby: { $ne: "self" } // $ne means "not equal"
//       });

//       res.status(200).json({
//         success: true,
//         count,
//         msg: "Total organization-registered users count fetched successfully"
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({
//         success: false,
//         msg: "Server error while fetching organization-registered users count",
//         error: error.message
//       });
//     }
//   };

// export const organizationMaleUsers = async (req, res) => {

//   try {
//     const maleUsersCount = await User.countDocuments({
//       gender: "Male",
//       isDeleted: false,
//       addedby: { $ne: "self" } // $ne means "not equal"
//     });
//     res.status(200).json({ success: true, count: maleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_MALE_USER_FETCHED_SUCCESS  });
//   }
// };

// export const organizationFemaleUsers = async (req, res) => {

//   try {
//     const femaleUsersCount = await User.countDocuments({
//       gender: "Female",
//       isDeleted: false,
//       addedby: { $ne: "self" } // $ne means "not equal"
//     });
//     res.status(200).json({ success: true, count: femaleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_FEMALE_USER_FETCHED_SUCCESS  });
//   }
// };

// export const organizationActiveUsers = async (req, res) => {
//   try {
//     const activeUsersCount = await User.countDocuments({
//       status: true,
//       isDeleted: false,
//       addedby: { $ne: "self" } // $ne means "not equal"
//     });
//     res.status(200).json({ success: true, count: activeUsersCount, msg:ORG_ACTIVE_USER_FETCHED_SUCCESS  });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

// export const organizationDeactiveUsers = async (req, res) => {

//   try {
//     const deactiveUsersCount = await User.countDocuments({
//       status: false,
//       isDeleted: false,
//       addedby: { $ne: "self" } // $ne means "not equal"
//     });
//     res.status(200).json({ success: true, count: deactiveUsersCount, msg:ORG_DEACTIVE_USER_FETCHED_SUCCESS  });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

// export const organizationAverageUserAge = async (req, res) => {

//   try {
//     const users = await User.find({ isDeleted: false,  addedby: { $ne: "self" }   }, 'dob');
//     const totalAge = users.reduce((sum, user) => {
//       const age = moment().diff(user.dob, 'years');
//       return sum + age;
//     }, 0);
//     const averageAge = totalAge / users.length;
//     res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

import {
  ORG_ACTIVE_USER_FETCHED_SUCCESS,
  ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS,
  ORG_DEACTIVE_USER_FETCHED_SUCCESS,
  ORG_FEMALE_USER_FETCHED_SUCCESS,
  ORG_MALE_USER_FETCHED_SUCCESS,
  SERVER_ERROR,
} from "../../helpers/messages.js";
import User from "../../models/UserModal.js";
import OrgRegister from "../../models/OrgRegisterModal.js";
import Feedback from "../../models/FeedbackModel.js";
import ContactUs from "../../models/ContactUsModal.js";
import Event from "../../models/EventModal.js";
import Complaint from "../../models/ComplaintModel.js";
import moment from "moment";

export const getUserStats = async (req, res) => {
  try {
    const [
      totalCount,
      maleCount,
      femaleCount,
      activeCount,
      deactiveCount,
      usersForAge,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ gender: "Male", isDeleted: false }),
      User.countDocuments({ gender: "Female", isDeleted: false }),
      User.countDocuments({ status: true, isDeleted: false }),
      User.countDocuments({ status: false, isDeleted: false }),
      User.find({ isDeleted: false }, "dob"),
    ]);

    const totalAge = usersForAge.reduce((sum, user) => {
      return sum + moment().diff(user.dob, "years");
    }, 0);
    const averageAge = (totalAge / usersForAge.length).toFixed(2);

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
      message: "User stats fetched successfully",
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

export const getOrganizationStats = async (req, res) => {
  try {
    const [
      totalOrgs,
      totalUsers,
      maleUsers,
      femaleUsers,
      activeUsers,
      deactiveUsers,
      activeOrgs,
      pendingOrgs,
      rejectedOrgs,
      usersForAge,
    ] = await Promise.all([
      OrgRegister.countDocuments({ isDeleted: false }),
      User.countDocuments({ isDeleted: false, addedby: { $ne: "self" } }),
      User.countDocuments({
        gender: "Male",
        isDeleted: false,
        addedby: { $ne: "self" },
      }),
      User.countDocuments({
        gender: "Female",
        isDeleted: false,
        addedby: { $ne: "self" },
      }),
      User.countDocuments({
        status: true,
        isDeleted: false,
        addedby: { $ne: "self" },
      }),
      User.countDocuments({
        status: false,
        isDeleted: false,
        addedby: { $ne: "self" },
      }),
      OrgRegister.countDocuments({
        isDeleted: false,
        approvalStatus: "approved",
      }),
      OrgRegister.countDocuments({
        isDeleted: false,
        approvalStatus: "pending",
      }),
      OrgRegister.countDocuments({
        isDeleted: false,
        approvalStatus: "rejected",
      }),
      User.find({ isDeleted: false, addedby: { $ne: "self" } }, "dob"),
    ]);

    const totalAge = usersForAge.reduce((sum, user) => {
      return sum + moment().diff(user.dob, "years");
    }, 0);
    const averageAge = (totalAge / (usersForAge.length || 1)).toFixed(2);

    res.status(200).json({
      success: true,
      stats: {
        totalOrganizations: totalOrgs,
        totalUsers: totalUsers,
        maleUsers: maleUsers,
        femaleUsers: femaleUsers,
        activeUsers: activeUsers,
        deactiveUsers: deactiveUsers,
        activeOrgs: activeOrgs,
        pendingOrgs: pendingOrgs,
        rejectedOrgs: rejectedOrgs,
        averageAge: isNaN(averageAge) ? 0 : averageAge,
      },
      message: "Organization stats fetched successfully",
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

export const getEventStats = async (req, res) => {
  try {
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
      message: "Event stats fetched successfully",
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

// export const getFeedbackStats = async (req, res) => {
//   try {
//     const [
//       totalFeedbacks,
//       ratingResult,
//       recommendedCount,
//       typeCounts,
//       mostPopularCategory,
//     ] = await Promise.all([
//       Feedback.countDocuments({ isDeleted: false }),
//       Feedback.aggregate([
//         { $match: { isDeleted: false } },
//         { $group: { _id: null, averageRating: { $avg: "$rating" } } },
//       ]),
//       Feedback.countDocuments({ isDeleted: false, recommend: true }),
//       Feedback.aggregate([
//         { $match: { isDeleted: false } },
//         { $group: { _id: "$feedbackType", count: { $sum: 1 } } },
//       ]),
//       Feedback.aggregate([
//         { $match: { isDeleted: false } },
//         {
//           $group: {
//             _id: "$feedbackType",
//             total: { $sum: 1 },
//           },
//         },
//         { $sort: { total: -1 } },
//         { $limit: 1 },
//       ]),
//     ]);

//     const averageRating = ratingResult[0]?.averageRating || 0;
//     const recommendationRate =
//       totalFeedbacks > 0 ? (recommendedCount / totalFeedbacks) * 100 : 0;

//     res.status(200).json({
//       success: true,
//       stats: {
//         total: totalFeedbacks,
//         averageRating: averageRating.toFixed(2),
//         recommendationRate: recommendationRate.toFixed(2),
//         byType: typeCounts,
//         mostPopularCategory: mostPopularCategory[0] || {
//           _id: "No data",
//           total: 0,
//         },
//       },
//       message: "Feedback stats fetched successfully",
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

export const getFeedbackStats = async (req, res) => {
  try {
    const [
      totalFeedbacks,
      ratingResult,
      recommendedCount,
      typeCounts,
      mostPopularCategory,
      categoryStats,
      ratingDistribution,
      statusCounts,
      recentFeedbacks,
      feedbackByType,
      monthlyTrends
    ] = await Promise.all([
      // Basic counts
      Feedback.countDocuments({ isDeleted: false }),
      
      // Average rating
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } },
      ]),
      
      // Recommendation count
      Feedback.countDocuments({ isDeleted: false, recommend: true }),
      
      // Feedback type counts
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$feedbackType", count: { $sum: 1 } } },
      ]),
      
      // Most popular category
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$feedbackCategory", total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      
      // Detailed category statistics
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { 
          $group: { 
            _id: "$feedbackCategory",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            recommendRate: { 
              $avg: { 
                $cond: [{ $eq: ["$recommend", true] }, 1, 0] 
              } 
            },
            positiveCount: {
              $sum: {
                $cond: [{ $gte: ["$rating", 4] }, 1, 0]
              }
            },
            negativeCount: {
              $sum: {
                $cond: [{ $lte: ["$rating", 2] }, 1, 0]
              }
            }
          } 
        },
        { $sort: { count: -1 } }
      ]),
      
      // Rating distribution (1-5 stars)
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      
      // Status counts
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      
      // Recent feedbacks (last 5)
      Feedback.find({ isDeleted: false })
        .sort({ createdDate: -1 })
        .limit(5)
        .select('feedbackCategory rating recommend feedbackMessage createdDate'),
      
      // Feedback by type (organization/user) with details
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { 
          $group: { 
            _id: "$feedbackType",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            recommendCount: { 
              $sum: { 
                $cond: [{ $eq: ["$recommend", true] }, 1, 0] 
              } 
            }
          } 
        }
      ]),
      
      // Monthly trends (last 6 months)
      Feedback.aggregate([
        { 
          $match: { 
            isDeleted: false,
            createdDate: { 
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) 
            } 
          } 
        },
        { 
          $group: { 
            _id: { 
              month: { $month: "$createdDate" },
              year: { $year: "$createdDate" }
            },
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" }
          } 
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ])
    ]);

    const averageRating = ratingResult[0]?.averageRating || 0;
    const recommendationRate = totalFeedbacks > 0 
      ? (recommendedCount / totalFeedbacks) * 100 
      : 0;

    // Format rating distribution
    const formattedRatingDistribution = Array(5).fill(0);
    ratingDistribution.forEach(item => {
      formattedRatingDistribution[item._id - 1] = item.count;
    });

    // Format monthly trends
    const formattedMonthlyTrends = monthlyTrends.map(item => ({
      month: `${item._id.month}/${item._id.year}`,
      count: item.count,
      avgRating: item.avgRating.toFixed(2)
    }));

    res.status(200).json({
      success: true,
      stats: {
        // Basic stats
        total: totalFeedbacks,
        averageRating: averageRating.toFixed(2),
        recommendationRate: recommendationRate.toFixed(2),
        
        // Categorization
        byType: typeCounts,
        mostPopularCategory: mostPopularCategory[0] || { _id: "No data", total: 0 },
        
        // Detailed category analytics
        categoryStats: categoryStats.map(cat => ({
          category: cat._id,
          count: cat.count,
          avgRating: cat.avgRating.toFixed(2),
          recommendRate: (cat.recommendRate * 100).toFixed(2) + '%',
          positiveCount: cat.positiveCount,
          negativeCount: cat.negativeCount,
          positivePercentage: ((cat.positiveCount / cat.count) * 100).toFixed(2) + '%',
          negativePercentage: ((cat.negativeCount / cat.count) * 100).toFixed(2) + '%'
        })),
        
        // Rating distribution
        ratingDistribution: formattedRatingDistribution,
        
        // Status counts
        statusCounts,
        
        // Recent feedbacks
        recentFeedbacks,
        
        // Feedback type analytics
        feedbackByType: feedbackByType.map(type => ({
          type: type._id,
          count: type.count,
          avgRating: type.avgRating.toFixed(2),
          recommendCount: type.recommendCount,
          recommendPercentage: ((type.recommendCount / type.count) * 100).toFixed(2) + '%'
        })),
        
        // Trends
        monthlyTrends: formattedMonthlyTrends,
        
        // Summary metrics
        summary: {
          totalPositive: categoryStats.reduce((sum, cat) => sum + cat.positiveCount, 0),
          totalNegative: categoryStats.reduce((sum, cat) => sum + cat.negativeCount, 0),
          totalOrganizational: feedbackByType.find(t => t._id === 'organization')?.count || 0,
          totalUser: feedbackByType.find(t => t._id === 'user')?.count || 0
        }
      },
      message: "Feedback stats fetched successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getQueryStats = async (req, res) => {
  try {
    // Get all metrics in parallel
    const [
      totalQueries,
      recentQueries,
      queriesByType,
      queriesWithResponse,
      popularTimes,
      deviceBreakdown,
    ] = await Promise.all([
      // Total queries
      ContactUs.countDocuments({ isDeleted: false }),

      // Recent queries (last 7 days)
      ContactUs.aggregate([
        {
          $match: {
            isDeleted: false,
            createDate: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createDate" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Queries by type
      ContactUs.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }, // Top 5 types only
      ]),

      // Queries with admin response (if you implement this feature)
      ContactUs.countDocuments({ isDeleted: false, responded: true }),

      // Most common inquiry times (hour of day)
      ContactUs.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: { $hour: "$createDate" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 3 }, // Top 3 hours
      ]),

      // Device breakdown (if you collect user-agent data)
      // This would require adding a deviceType field to your model
      ContactUs.aggregate([
        { $match: { isDeleted: false, deviceType: { $exists: true } } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Process recent queries data for charting
    const last7Days = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      })
      .reverse();

    const recentQueriesData = last7Days.map((date) => {
      const found = recentQueries.find((item) => item._id === date);
      return {
        date,
        count: found ? found.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        // Basic counts
        totalQueries,
        queriesWithResponse, // If you track responses

        // Trend analysis
        recentQueries: recentQueriesData,
        queryTrend:
          recentQueriesData.reduce((sum, day) => sum + day.count, 0) / 7,

        // Category analysis
        topQueryTypes: queriesByType,
        mostCommonType: queriesByType[0]?._id || "N/A",

        // Timing analysis
        peakHours: popularTimes.map((hour) => ({
          hour: hour._id,
          count: hour.count,
        })),

        // Device breakdown (if available)
        deviceBreakdown:
          deviceBreakdown.length > 0 ? deviceBreakdown : undefined,
      },
      message: "Query stats fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching query stats:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching query statistics",
      error: error.message,
    });
  }
};

export const getBasicComplaintStats = async (req, res) => {
  try {
    // Get all basic stats in parallel for better performance
    const [total, pendingComplaint, resolvedComplaint] = await Promise.all([
      Complaint.countDocuments({ isDeleted: false }),
      Complaint.countDocuments({ status: "pending", isDeleted: false }),
      Complaint.countDocuments({ status: "resolved", isDeleted: false }),
    ]);

    // Get recent complaints (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentComplaint = await Complaint.countDocuments({
      createdDate: { $gte: thirtyDaysAgo },
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      stats: {
        total,
        pendingComplaint,
        resolvedComplaint,
        recentComplaint,
      },
      message: "fetched complaint detailed successfully",
    });
  } catch (error) {
    console.error("Error fetching basic complaint stats:", error);
    res.status(500).json({
      message: "Failed to fetch basic complaint statistics",
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