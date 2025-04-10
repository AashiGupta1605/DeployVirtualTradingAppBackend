
import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrgRegister", // Reference to the Organization model (optional)
    },
  category: {
    type: String,
    enum: [
      "Account Issues",
      "Payment Problems",
      "Technical Errors",
      "Service Quality",
      "Other",
    ],
    required: true,
  },
  complaintMessage: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "solved"],
    default: "pending",
  },
  isSatisfied: {
    type: String,
    enum: ["satisfied", "not_satisfied"],
    default: null, // Only set after resolution
  },
  complaintType: {
    type: String,
    enum: ["organization", "user"],
    // default: "user"
    // required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);
export default Complaint;