import {
    getUserStats,
    getOrganizationStats,
    getEventStats,
    getFeedbackStats,
    getQueryStats
  } from '../../controllers/admin/statsController.js';
  
  export const getDashboardStats = async (req, res) => {
    try {
      const [
        userStats,
        orgStats,
        eventStats,
        feedbackStats,
        queryStats
      ] = await Promise.all([
        getUserStats(req, res),
        getOrganizationStats(req, res),
        getEventStats(req, res),
        getFeedbackStats(req, res),
        getQueryStats(req, res)
      ]);
  
      res.status(200).json({
        success: true,
        stats: {
          users: userStats.stats,
          organizations: orgStats.stats,
          events: eventStats.stats,
          feedback: feedbackStats.stats,
          queries: queryStats.stats
        },
        message: "Dashboard stats fetched successfully"
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch dashboard stats",
        error: error.message 
      });
    }
  };