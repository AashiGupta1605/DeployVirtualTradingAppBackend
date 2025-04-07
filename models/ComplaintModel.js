// import mongoose from 'mongoose';

// const complaintSchema = new mongoose.Schema({
//   id: { type: String, required: true },
//   userId: { type: String, required: true },
//   type: { type: String },
//   desc: { type: String },
//   status: { type: Boolean, default: true },
//   createdDate: { type: Date, default: Date.now },
//   updatedDate: { type: Date, default: Date.now }
// });

// const Complaint = mongoose.model('Complaint', complaintSchema);
// export default Complaint;

import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
    enum: ["pending", "in_progress", "resolved"],
    default: "pending",
  },
  isSatisfied: {
    type: String,
    enum: ["satisfied", "not_satisfied"],
    default: null, // Only set after resolution
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
