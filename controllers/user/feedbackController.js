// import { organizationFeedbackValidationSchema } from "../../helpers/joiValidation.js";
import { buildDateQuery, buildSearchQuery } from "../../helpers/dataHandler.js";
import { ORG_FEEDABACK_INVALID_STATUS_VALUE, ORG_FEEDBACK_DELETE_SUCCESS, ORG_FEEDBACK_FETCHED_SUCCESS, ORG_FEEDBACK_NOT_FOUND, ORG_FEEDBACK_STATUS_SUCCESS, ORG_FEEDBACK_UPDATE_SUCCESS, ORG_ID_REQUIRED, SERVER_ERROR } from "../../helpers/messages.js";
import Feedback from "../../models/FeedbackModel.js";


//-------------------------------------------Guest User side--------------------------------------------------

export const getAllUsersFeedbacks = async (req, res) => { 
    try {
        const {organization, category, recommend, search, sortBy, order} = req.params

        // Convert 'increasing' or 'decreasing' to 1 or -1 for MongoDB sorting
        const sortOrder = order === "increasing" ? 1 : -1;

        // Give ERror as filteredData is not a mongoose query, 
        // it's just an array of objects so can't apply .find() query

        // const filteredData=await Feedback.find({ isDeleted: false })
        // const filter = category && category !== "undefined" ? { feedbackCategory: category } : {};
        // const feedbackData = await filteredData.find(filter).sort({[sortBy]:sortOrder})

        const filter = { isDeleted: false, status:"approved", feedbackType:"user"};

        if (category && category.trim() !== "" && category !== "all") {
            filter.feedbackCategory = { $regex: new RegExp(category, "i") };
        }

        if(recommend && recommend.trim()!=="" && recommend !== "all"){
          filter.recommend = recommend
        }

        // if (search && search.trim() !== "" && search !== "all") {
        //   filter.$or = [
        //       { feedbackMessage: { $regex: new RegExp(search, "i") } },
        //       { suggestions: { $regex: new RegExp(search, "i") } }
        //   ];
        // }
        // Fetch filtered & sorted feedback data
        // const feedbackData = await Feedback.find(filter).sort({ [sortBy]: sortOrder });

        let feedbackData = await Feedback.find(filter)
            .populate({
                path: "userId",  // Populates `userId`
                select: "name", // Only fetches user name
            })
            .populate({
              path: "organizationId",  
              select: "name",  // Only fetches organization name
          })
          .sort({ [sortBy]: sortOrder });

        if (organization && organization.trim() !== "" && organization !== "all" && organization!=="All") {
            feedbackData = feedbackData.filter(
                (feedback) => feedback.organizationId?.name === organization
            );
        }

        if (search && search.trim() !== "" && search !== "all") {

          let MatchesByUserNameFirstLetter = feedbackData.filter(
            (feedback) => feedback.userId?.name?.toLowerCase().startsWith(search.toLowerCase())
          );
    
          if (MatchesByUserNameFirstLetter.length > 0) {
            return res.status(201).json({ success: true, feedbackData: MatchesByUserNameFirstLetter });
          }
    
          feedbackData = feedbackData.filter(
            (feedback) =>
              feedback.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
              feedback.feedbackMessage?.toLowerCase().includes(search.toLowerCase()) ||
              feedback.suggestions?.toLowerCase().includes(search.toLowerCase())
          );

        }

        res.status(201).json({ success: true, feedbackData });
    } 
    catch (error) {
        console.error('Error in geting user feedbacks data: ', error);
        res.status(500).json({ success: false, message: "Failed to get feedback data from database.", error });
    }
};

export const getAllCompleteFeedbacks = async(req,res)=>{
    try{
        const feedbackData = await Feedback.find({ isDeleted: false })
        res.status(201).json({ success: true, feedbackData });
    }
    catch(error){
        console.log('Error in geting user feedbacks data: ', error);
        res.status(500).json({ success: false, message: "Failed to get feedback data from database.", error });
    }
};

export const getAllOrganizationsFeedbacks = async(req,res)=>{
  try {
    const {category, recommend, search, sortBy, order} = req.params

    const sortOrder = order === "increasing" ? 1 : -1;

    const filter = { isDeleted: false, status:"approved", feedbackType:"organization"};

    if (category && category.trim() !== "" && category !== "all") {
        filter.feedbackCategory = { $regex: new RegExp(category, "i") };
    }
    if(recommend && recommend.trim()!=="" && recommend !== "all" ){
      filter.recommend = recommend
    }

    let feedbackData = await Feedback.find(filter)
    .populate({
        path: "organizationId",  
        select: "name", 
    })
    .sort({ [sortBy]: sortOrder });

    if (search && search.trim() !== "" && search !== "all") {

      let MatchesByOrganizationNameFirstLetter = feedbackData.filter(
        (feedback) => feedback.organizationId?.name?.toLowerCase().startsWith(search.toLowerCase())
      );

      if (MatchesByOrganizationNameFirstLetter.length > 0) {
        return res.status(201).json({ success: true, feedbackData: MatchesByOrganizationNameFirstLetter });
      }

      feedbackData = feedbackData.filter(
        (feedback) =>
          feedback.organizationId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          feedback.feedbackMessage?.toLowerCase().includes(search.toLowerCase()) ||
          feedback.suggestions?.toLowerCase().includes(search.toLowerCase())
      );

    }

    res.status(201).json({ success: true, feedbackData });
  } 
  catch (error) {
    console.error('Error in geting user feedbacks data: ', error);
    res.status(500).json({ success: false, message: "Failed to get feedback data from database.", error });
  }
}

//-----------------------------------------Guest User side-----------------------------------------------------

// // organization user feedbacks - crud operations

// Display organization users' feedback


// export const organizationUsersFeedbackDisplay = async (req, res) => {
//   try {
//     const orgName = req.params.orgName;
//     const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

//     const searchQuery = buildSearchQuery(search);
//     const dateQuery = buildDateQuery(startDate, endDate);

//     const feedbacks = await Feedback.find({
//       addedby: orgName,
//       feedbackType: "user",
//       isDeleted: false,
//       ...dateQuery,
//     })
//       .populate({
//         path: "userId",
//         match: searchQuery,
//         select: "name email mobile",
//       })
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .exec();

//     const filteredFeedbacks = feedbacks.filter((feedback) => feedback.userId !== null);

//     const totalFeedbacks = await Feedback.countDocuments({
//       addedby: orgName,
//       feedbackType: "user",
//       isDeleted: false,
//       ...dateQuery,
//     });
//     // .populate({
//     //   path: "userId",
//     //   match: searchQuery,
//     // });

//     res.status(200).json({
//       feedbacks: filteredFeedbacks,
//       totalPages: Math.ceil(totalFeedbacks / limit),
//       currentPage: Number(page),
//     });
//   } catch (error) {
//     console.error("Error fetching feedbacks by organization users:", error);
//     res.status(500).json({ error: "Failed to fetch feedbacks." });
//   }
// };



// ======================================ORGANIZATION USER FEEDABCKS CONTROLLER=======================================

export const organizationUsersFeedbackDisplay = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

    console.log("orgName:", orgName);
    console.log("search:", search);
    console.log("startDate:", startDate, "endDate:", endDate);

    const searchQuery = buildSearchQuery(search);
    const dateQuery = buildDateQuery(startDate, endDate);

    console.log("searchQuery:", searchQuery);
    console.log("dateQuery:", dateQuery);

    const feedbacks = await Feedback.find({
      addedby: orgName,
      feedbackType: "user",
      isDeleted: false,
      ...dateQuery,
    })
      .populate({
        path: "userId",
        match: searchQuery,
        select: "name email mobile",
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    console.log("feedbacks before filtering:", feedbacks);

    const filteredFeedbacks = feedbacks.filter((feedback) => feedback.userId !== null);

    console.log("filteredFeedbacks:", filteredFeedbacks);

    const totalFeedbacks = await Feedback.countDocuments({
      addedby: orgName,
      feedbackType: "user",
      isDeleted: false,
      ...dateQuery,
    });

    console.log("totalFeedbacks:", totalFeedbacks);

    res.status(200).json({
      feedbacks: filteredFeedbacks,
      totalPages: Math.ceil(totalFeedbacks / limit),
      currentPage: Number(page),
      msg:ORG_FEEDBACK_FETCHED_SUCCESS,
      success:true, 
    });
  } catch (error) {
    console.error("Error fetching feedbacks by organization users:", error);
    res.status(500).json({ error: error.msg, success:false, msg:SERVER_ERROR });
  }
};

// new one by id


// Delete organization user's feedback

export const organizationUsersFeedbackDelete = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback || feedback.isDeleted) {
      return res.json({ success: false, msg: ORG_FEEDBACK_NOT_FOUND });
    }

    feedback.isDeleted = true;
    feedback.updatedDate = Date.now();

    await feedback.save();

    res.status(200).json({ success: true, msg: ORG_FEEDBACK_DELETE_SUCCESS });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.msg, success:false, msg:SERVER_ERROR  });
  }
};


// new one by id

// Update organization user's feedback
export const updateOrganizationUsersFeedback = async (req, res) => {
  try {
    const { feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback || feedback.isDeleted) {
      return res.status(404).json({ success: false, msg: ORG_FEEDBACK_NOT_FOUND });
    }

    feedback.feedbackCategory = feedbackCategory;
    feedback.feedbackMessage = feedbackMessage;
    feedback.rating = rating;
    feedback.recommend = recommend;
    feedback.suggestions = suggestions;
    feedback.updatedDate = Date.now();

    await feedback.save();

    res.status(200).json({ success: true, msg: ORG_FEEDBACK_UPDATE_SUCCESS, feedback });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: error.msg, success:false, msg:SERVER_ERROR });
  }
};



// by id 



// Update feedback status
export const updateUsersFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, msg: ORG_FEEDABACK_INVALID_STATUS_VALUE });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status, updatedDate: Date.now() },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, msg: ORG_FEEDBACK_NOT_FOUND });
    }

    res.status(200).json({ success: true, msg: ORG_FEEDBACK_STATUS_SUCCESS, feedback });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({ error: error.msg, success:false, msg:SERVER_ERROR });
  }
};


// by id 



// organization feedbacks  - crud opeartions

// Register organization feedback 
// organization register by added by orgame 

export const registerOrganizationFeedback = async (req, res) => {
  const { orgName, feedbackCategory, organizationId, feedbackMessage, rating, recommend, suggestions } = req.body;

  try {

        // Validate that organizationId is provided
        if (!organizationId) {
          return res.status(400).json({ success: false, message: ORG_ID_REQUIRED });
        }

        
    const newFeedback = new Feedback({
      feedbackCategory,
      feedbackMessage,
      rating,
      recommend,
      suggestions,
      addedby: orgName, // Set the organization name
      feedbackType:"organization",
      organizationId
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: error.message, success:false, message:SERVER_ERROR});
  }
};


// org register by organizationId

// export const registerOrganizationFeedback = async (req, res) => {
//   const { organizationId, feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;

//   try {
//     const newFeedback = new Feedback({
//       organizationId,
//       feedbackCategory,
//       feedbackMessage,
//       rating,
//       recommend,
//       suggestions,
//       feedbackType: "organization",
//     });

//     await newFeedback.save();

//     res.status(201).json({
//       success: true,
//       message: "Feedback submitted successfully",
//       feedback: newFeedback,
//     });
//   } catch (error) {
//     console.error("Error submitting feedback:", error);
//     res.status(500).json({ success: false, message: "Failed to submit feedback" });
//   }
// };



// Display organization feedback
// display org feedabck by orgname 
export const displayOrganizationFeedback = async (req, res) => {
  const orgName = req.params.orgName;
  const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

  try {
    const searchQuery = buildSearchQuery(search);
    const dateQuery = buildDateQuery(startDate, endDate);

    const feedbacks = await Feedback.find({
      addedby: orgName,
      feedbackType: "organization",
      isDeleted: false,
      ...dateQuery,
      ...searchQuery,
    })
    .populate({
      path: "organizationId",
      select: "name email mobile",
    })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdDate: -1 });

    const totalFeedbacks = await Feedback.countDocuments({
      addedby: orgName,
      feedbackType: "organization",
      isDeleted: false,
      ...dateQuery,
      ...searchQuery,
    });

    res.status(200).json({
      feedbacks,
      totalPages: Math.ceil(totalFeedbacks / limit),
      currentPage: Number(page),
      msg:ORG_FEEDBACK_FETCHED_SUCCESS
    });
  } catch (error) {
    console.error("Error fetching organization feedback:", error);
    res.status(500).json({ error: error.msg, success:false, msg:SERVER_ERROR });
  }
};



// displaty org feedabncks using id 
// export const displayOrganizationFeedback = async (req, res) => {
//   const organizationId = req.params.organizationId;
//   const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

//   try {
//     const searchQuery = buildSearchQuery(search);
//     const dateQuery = buildDateQuery(startDate, endDate);

//     const feedbacks = await Feedback.find({
//       organizationId,
//       feedbackType: "organization",
//       isDeleted: false,
//       ...dateQuery,
//       ...searchQuery,
//     })
//       .populate({
//         path: "organizationId"
//       })
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdDate: -1 });

//     const totalFeedbacks = await Feedback.countDocuments({
//       organizationId,
//       feedbackType: "organization",
//       isDeleted: false,
//       ...dateQuery,
//       ...searchQuery,
//     });

//     res.status(200).json({
//       feedbacks,
//       totalPages: Math.ceil(totalFeedbacks / limit),
//       currentPage: Number(page),
//     });
//   } catch (error) {
//     console.error("Error fetching organization feedback:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch feedback" });
//   }
// };

export const updateOrganizationFeedback = async (req, res) => {
const { feedbackId } = req.params;
const { feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;

try {
  const updatedFeedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    { feedbackCategory, feedbackMessage, rating, recommend, suggestions, updatedDate: Date.now() },
    { new: true }
  );

  if (!updatedFeedback) {
    return res.status(404).json({ success: false, message: ORG_FEEDBACK_NOT_FOUND });
  }

  res.status(200).json({
    success: true,
    message: ORG_FEEDBACK_UPDATE_SUCCESS,
    feedback: updatedFeedback,
  });
} catch (error) {
  console.error("Error updating feedback:", error);
  res.status(500).json({ error: error.message, success:false, message:SERVER_ERROR});
}
};

// Soft delete feedback
export const deleteOrganizationFeedback = async (req, res) => {
const { feedbackId } = req.params;

try {
  const deletedFeedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    { isDeleted: true, updatedDate: Date.now() },
    { new: true }
  );

  if (!deletedFeedback) {
    return res.status(404).json({ success: false, message: ORG_FEEDBACK_NOT_FOUND });
  }

  res.status(200).json({
    success: true,
    message: ORG_FEEDBACK_DELETE_SUCCESS,
    feedback: deletedFeedback,
  });
} catch (error) {
  console.error("Error deleting feedback:", error);
  res.status(500).json({ error: error.message, success:false, message:SERVER_ERROR});
}
};







// user code ---------------------------------------

import User from "../../models/UserModal.js";
import { feedbackSchema } from "../../helpers/userValidation.js";


// // Create Feedback
// export const createFeedback = async (req, res) => {
//     try {
//         const { userId, feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;
  
//         // Check if user exists
//         const userExists = await User.findById(userId);
//         if (!userExists) {
//             return res.status(404).json({ message: "User not found" });
//         }
  
//         const newFeedback = new Feedback({
//             userId,
//             feedbackCategory,
//             feedbackMessage,
//             rating,
//             recommend,
//             suggestions
//         });
  
//         await newFeedback.save();
//         res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
//     } catch (error) {
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
//   };
  

// new one:

// export const createFeedback = async (req, res) => {
//   try {
//     const { userId, organizationId, feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;
//     // if(userId){
//     //   return res.status(400).json({message:"user id does not exisit", success:false});
//     // }

//     // const user = await User.findById({_id:userId});
//     // console.log(user);

//     const feedback = new Feedback({
//       userId,
//       organizationId,
//       feedbackCategory,
//       feedbackMessage,
//       rating,
//       recommend,
//       suggestions,
//       feedbackType:"user",
//       // addedby:user.addedby
//     });

//     await feedback.save();

//     res.status(201).json({ success: true, msg: "Feedback created successfully.", feedback });
//   } catch (error) {
//     console.error("Error creating feedback:", error);
//     res.status(500).json({ success: false, msg: "Failed to create feedback." });
//   }
// };



export const createFeedback = async (req, res) => {
  try {
    // Validate request body
    const { error } = feedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { userId, feedbackCategory, feedbackMessage, rating, recommend, suggestions } = req.body;

    // Fetch the user to get the addedby field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const feedback = new Feedback({
      userId,
      feedbackCategory,
      feedbackMessage,
      rating,
      recommend,
      suggestions,
      feedbackType: "user",
      addedby: user.addedby,
    });

    await feedback.save();

    res.status(201).json({ success: true, msg: "Feedback created successfully.", feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ success: false, msg: "Failed to create feedback." });
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





  // admin feedabck controllers

// In feedbackController.js

export const getAllFeedbackAdmin = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ isDeleted: { $ne: true } }) // Exclude deleted feedback
      .populate('userId', 'name email mobile') // Populate user details
      .populate('organizationId', 'name email') // Populate organization details
      .sort({ createdDate: -1 });

    console.log('Fetched feedbacks:', feedbacks);

    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error in getAllFeedbackAdmin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch feedbacks'
    });
  }
};

  
  // Get feedback by ID
  export const getFeedbackByIdAdmin = async (req, res) => {
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