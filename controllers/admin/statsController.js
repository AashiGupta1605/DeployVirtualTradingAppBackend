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
  SERVER_ERROR 
} from '../../helpers/messages.js';
import User from '../../models/UserModal.js';
import OrgRegister from '../../models/OrgRegisterModal.js';
import Feedback from '../../models/FeedbackModel.js';
import ContactUs from '../../models/ContactUsModal.js';
import Event from '../../models/EventModal.js';
import Complaint from '../../models/ComplaintModal.js';
import moment from 'moment';

export const getUserStats = async (req, res) => {
  try {
    const [
      totalCount,
      maleCount,
      femaleCount,
      activeCount,
      deactiveCount,
      usersForAge
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ gender: "Male", isDeleted: false }),
      User.countDocuments({ gender: "Female", isDeleted: false }),
      User.countDocuments({ status: true, isDeleted: false }),
      User.countDocuments({ status: false, isDeleted: false }),
      User.find({ isDeleted: false }, 'dob')
    ]);

    const totalAge = usersForAge.reduce((sum, user) => {
      return sum + moment().diff(user.dob, 'years');
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
        averageAge: isNaN(averageAge) ? 0 : averageAge
      },
      message: "User stats fetched successfully"
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: SERVER_ERROR,
      error: error.message 
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
      usersForAge
    ] = await Promise.all([
      OrgRegister.countDocuments({ isDeleted: false }),
      User.countDocuments({ isDeleted: false, addedby: { $ne: "self" } }),
      User.countDocuments({ gender: "Male", isDeleted: false, addedby: { $ne: "self" } }),
      User.countDocuments({ gender: "Female", isDeleted: false, addedby: { $ne: "self" } }),
      User.countDocuments({ status: true, isDeleted: false, addedby: { $ne: "self" } }),
      User.countDocuments({ status: false, isDeleted: false, addedby: { $ne: "self" } }),
      OrgRegister.countDocuments({ isDeleted: false, approvalStatus:"approved" }),
      OrgRegister.countDocuments({ isDeleted: false, approvalStatus:"pending" }),
      OrgRegister.countDocuments({ isDeleted: false, approvalStatus:"rejected" }),
      User.find({ isDeleted: false, addedby: { $ne: "self" } }, 'dob')
    ]);

    const totalAge = usersForAge.reduce((sum, user) => {
      return sum + moment().diff(user.dob, 'years');
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
        activeOrgs:activeOrgs,
        pendingOrgs:pendingOrgs,
        rejectedOrgs:rejectedOrgs,
        averageAge: isNaN(averageAge) ? 0 : averageAge
      },
      message: "Organization stats fetched successfully"
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: SERVER_ERROR,
      error: error.message 
    });
  }
};





export const getEventStats = async (req, res) => {
  try {
    const [
      totalEvents,
      upcomingEvents,
      completedEvents,
      ongoingEvents
    ] = await Promise.all([
      Event.countDocuments({ isDeleted: false }),
      Event.countDocuments({ isDeleted: false, type: "upcoming" }),
      Event.countDocuments({ isDeleted: false, type: "completed" }),
      Event.countDocuments({ isDeleted: false, type: "ongoing" })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalEvents,
        upcoming: upcomingEvents,
        completed: completedEvents,
        ongoing: ongoingEvents
      },
      message: "Event stats fetched successfully"
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: SERVER_ERROR,
      error: error.message 
    });
  }
};




export const getFeedbackStats = async (req, res) => {
  try {
    const [
      totalFeedbacks,
      ratingResult,
      recommendedCount,
      typeCounts,
      mostPopularCategory
    ] = await Promise.all([
      Feedback.countDocuments({ isDeleted: false }),
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }
      ]),
      Feedback.countDocuments({ isDeleted: false, recommend: true }),
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$feedbackType", count: { $sum: 1 } } }
      ]),
      Feedback.aggregate([
        { $match: { isDeleted: false } },
        { 
          $group: { 
            _id: "$feedbackType", 
            total: { $sum: 1 } 
          }
        },
        { $sort: { total: -1 } },
        { $limit: 1 }
      ])
    ]);

    const averageRating = ratingResult[0]?.averageRating || 0;
    const recommendationRate = totalFeedbacks > 0 ? 
      (recommendedCount / totalFeedbacks) * 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        total: totalFeedbacks,
        averageRating: averageRating.toFixed(2),
        recommendationRate: recommendationRate.toFixed(2),
        byType: typeCounts,
        mostPopularCategory: mostPopularCategory[0] || { _id: "No data", total: 0 }
      },
      message: "Feedback stats fetched successfully"
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: SERVER_ERROR,
      error: error.message 
    });
  }
};






// export const getQueryStats = async (req, res) => {
//   try {
//     const totalQueries = await Complaint.countDocuments({ isDeleted: false });

//     res.status(200).json({
//       success: true,
//       stats: {
//         total: totalQueries
//       },
//       message: "Query stats fetched successfully"
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ 
//       success: false, 
//       message: SERVER_ERROR,
//       error: error.message 
//     });
//   }
// };

export const getQueryStats = async (req, res) => {
  try {
    // Get all metrics in parallel for better performance
    const [
      totalQueries,
      pendingQueries,
      completedQueries,
      resolvedQueriesWithDates
    ] = await Promise.all([
      // Total queries (non-deleted)
      ContactUs.countDocuments({ isDeleted: false }),
      // Pending queries (status: false)
      ContactUs.countDocuments({ isDeleted: false, status: false }),
      
      // Completed queries (status: true)
      ContactUs.countDocuments({ isDeleted: false, status: true }),
      
      // Get resolved queries with dates for calculating resolution time
      ContactUs.find({ 
        isDeleted: false, 
        status: true,
        createdDate: { $exists: true },
        updatedDate: { $exists: true }
      }, 'createdDate updatedDate')
    ]);

    // Calculate average resolution time in days
    let averageResolutionDays = 0;
    if (resolvedQueriesWithDates.length > 0) {
      const totalResolutionTime = resolvedQueriesWithDates.reduce((sum, query) => {
        const resolutionTime = query.updatedDate - query.createdDate;
        return sum + resolutionTime;
      }, 0);
      
      averageResolutionDays = (totalResolutionTime / resolvedQueriesWithDates.length) / (1000 * 60 * 60 * 24);
      averageResolutionDays = parseFloat(averageResolutionDays.toFixed(2)); // Round to 2 decimal places
    }

    res.status(200).json({
      success: true,
      stats: {
        total: totalQueries,
        pending: pendingQueries,
        completed: completedQueries,
        averageResolutionDays: averageResolutionDays,
        resolutionRate: totalQueries > 0 
          ? parseFloat(((completedQueries / totalQueries) * 100).toFixed(2))
          : 0
      },
      message: "Query stats fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching query stats:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching query statistics",
      error: error.message 
    });
  }
};