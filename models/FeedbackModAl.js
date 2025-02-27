const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  feedbackCategory: {
    type: String,
    enum: [
      "Website UI/UX",
      "Trading Features",
      "Data Accuracy",
      "Performance & Speed",
      "Customer Support",
      "Other"
    ],
    required: true,
  },
  feedbackMessage: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  recommend: { type: Boolean, required: true },
  suggestions: { type: String, default: "" },
  isDeleted: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);