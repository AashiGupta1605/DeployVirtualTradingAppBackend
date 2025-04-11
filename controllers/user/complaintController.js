import Complaint from "../../models/ComplaintModel.js";
import User from "../../models/UserModal.js";
import { ORG_COMPLAINT_NOT_FOUND ,ORG_COMPLAINT_DELETE_SUCCESS,ORG_COMPLAINT_UPDATE_SUCCESS,ORG_COMPLAINT_FETCHED_SUCCESS, COMPLAINT_SUBMITTED_SUCCESS, ORG_ID_REQUIRED, SERVER_ERROR } from "../../helpers/messages.js";
import { buildDateQuery, buildSearchQuery } from "../../helpers/dataHandler.js";

// Create Complaint
export const createComplaint = async (req, res) => {
  try {
    const { userId, category, complaintMessage } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const complaint = new Complaint({
      userId,
      category,
      complaintMessage,
    });

    await complaint.save();

    res.status(201).json({ success: true, msg: "Complaint submitted successfully.", complaint });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ success: false, msg: "Failed to submit complaint." });
  }
};

// Get All Complaints
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isDeleted: false }).populate("userId", "name email");
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get Complaint by User ID
export const getComplaintByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.find({ userId: id }).populate("userId", "name email mobile");

    if (!complaint.length) {
      return res.status(404).json({ message: "No complaint found" });
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Complaint
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedComplaint = await Complaint.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json({ message: "Complaint updated successfully", complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Soft Delete Complaint
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// Get all complaints for admin

//admin controllers
// Get all complaints (users + organizations)
// export const getAllComplaintsAdmin = async (req, res) => {
//   try {
//     const complaints = await Complaint.find({ isDeleted: { $ne: true } })
//       .populate("userId", "name email mobile")
//       .populate("organizationId", "name email mobile")
//       .sort({ complaintDate: -1 });

//     res.status(200).json({
//       success: true,
//       data: complaints,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch complaints",
//     });
//   }
// };

export const getAllUserComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      isDeleted: { $ne: true },
      userId: { $ne: null }, // Only user complaints
    })
      .populate("userId", "name email mobile")
      .sort({ complaintDate: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user complaints",
      error: error.message,
    });
  }
};


export const getAllOrganizationComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      isDeleted: { $ne: true },
      organizationId: { $ne: null }, // Only organization complaints
    })
      .populate("organizationId", "name email mobile")
      .sort({ complaintDate: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization complaints",
      error: error.message,
    });
  }
};


// Get complaint by ID
export const getComplaintByIdAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email")
      .populate("organizationId", "name email");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

// Update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          updatedDate: Date.now(),
        },
      },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("organizationId", "name email");

    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: updatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
};

// Soft delete complaint
export const softDeleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: true,
          updatedDate: Date.now(),
        },
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
};

// Complaint statistics
export const getComplaintStats = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isDeleted: false });

    const stats = {
      total: complaints.length,
      categoryDistribution: {},
    };

    complaints.forEach((c) => {
      stats.categoryDistribution[c.category] = (stats.categoryDistribution[c.category] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint stats",
      error: error.message,
    });
  }
};


//Organization controllers

export const registerOrganizationComplaint = async (req, res) => {
  const {
    orgName,
    category,
    complaintMessage,
    organizationId,
  } = req.body;

  try {
    // Validate that organizationId is provided
    if (!organizationId) {
      return res.status(400).json({ success: false, message: ORG_ID_REQUIRED });
    }

    const newComplaint = new Complaint({
      category,
      complaintMessage,
      complaintType: "organization",
      organizationId,
      addedby: orgName, // if you're using this like in Feedback
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: COMPLAINT_SUBMITTED_SUCCESS,
      complaint: newComplaint,
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};


export const displayOrganizationComplaints = async (req, res) => {
  const orgName = req.params.orgName;
  const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

  try {
    const searchQuery = buildSearchQuery(search);
    const dateQuery = buildDateQuery(startDate, endDate);

    const complaints = await Complaint.find({
      complaintType: "organization",
      isDeleted: false,
      ...dateQuery,
      ...searchQuery,
    })
      .populate({
        path: "organizationId",
        match: { name: orgName }, // Match based on orgName
        select: "name email mobile",
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdDate: -1 });

    // Filter out complaints with no matched organization (in case match fails)
    const filteredComplaints = complaints.filter(c => c.organizationId);

    const totalComplaints = await Complaint.countDocuments({
      complaintType: "organization",
      isDeleted: false,
      ...dateQuery,
      ...searchQuery,
    }).populate({
      path: "organizationId",
      match: { name: orgName },
    });

    res.status(200).json({
      complaints: filteredComplaints,
      totalPages: Math.ceil(filteredComplaints.length / limit),
      currentPage: Number(page),
      msg: ORG_COMPLAINT_FETCHED_SUCCESS,
    });
  } catch (error) {
    console.error("Error fetching organization complaints:", error);
    res.status(500).json({
      success: false,
      msg: SERVER_ERROR,
      error: error.message,
    });
  }
};


export const updateOrganizationComplaint = async (req, res) => {
  const { complaintId } = req.params;
  const { category, complaintMessage, status, isSatisfied } = req.body;

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        category,
        complaintMessage,
        status,
        isSatisfied,
        updatedDate: Date.now(),
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return res
        .status(404)
        .json({ success: false, message: ORG_COMPLAINT_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      message: ORG_COMPLAINT_UPDATE_SUCCESS,
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};


export const deleteOrganizationComplaint = async (req, res) => {
  const { complaintId } = req.params;

  try {
    const deletedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { isDeleted: true, updatedDate: Date.now() },
      { new: true }
    );

    if (!deletedComplaint) {
      return res
        .status(404)
        .json({ success: false, message: ORG_COMPLAINT_NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      message: ORG_COMPLAINT_DELETE_SUCCESS,
      complaint: deletedComplaint,
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({
      success: false,
      message: SERVER_ERROR,
      error: error.message,
    });
  }
};
