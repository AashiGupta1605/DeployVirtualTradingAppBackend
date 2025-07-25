


import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (optional)
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrgRegister", // Reference to the Organization model (optional)
  },
  feedbackCategory: {
    type: String,
    enum: [
      "Website UI/UX",
      "Trading Features",
      "Data Accuracy",
      "Performance & Speed",
      "Customer Support",
      "Other",
    ],
    required: true,
  },
  feedbackMessage: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  recommend: { type: Boolean, required: true },
  suggestions: { type: String, default: "" },
  status: {
    type: String,
    enum: ["approved", "rejected"],
    default: "approved",
  },
    addedby: { type: String }, // Organization name
    feedbackType: {
      type: String,
      enum: ["organization", "user"],
      // default: "user"
      // required: true,
    },
    
  isDeleted: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;