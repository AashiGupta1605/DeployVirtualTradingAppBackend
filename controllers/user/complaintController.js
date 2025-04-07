import Complaint from "../../models/ComplaintModel.js";
import User from "../../models/UserModal.js";

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
export const getAllComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isDeleted: { $ne: true } })
      .populate("userId", "name email mobile")
      .sort({ complaintDate: -1 });
    //  console.log('Fetched complaints:', complaints);

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch complaints",
    });
  }
};

// Get complaint by ID
export const getComplaintByIdAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email");

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
    ).populate("userId", "name email");

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

// Complaint statistics (optional)
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