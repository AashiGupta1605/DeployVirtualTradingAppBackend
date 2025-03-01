<<<<<<< HEAD
// const mongoose = require("mongoose");
=======
>>>>>>> d1794dc36f5bee0a41b7ad971905d7d1c0e67433
import mongoose from "mongoose";

// models/FeedbackModal.js
const FeedbackSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
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
    status: { 
        type: String, 
        enum: ['approved', 'rejected'],
        default: 'approved' 
    },
    isDeleted: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now }
});

<<<<<<< HEAD
// module.exports = mongoose.model("Feedback", FeedbackSchema);
const UserFeedback = mongoose.model('Feedback',FeedbackSchema);
export default UserFeedback;


=======
const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
>>>>>>> d1794dc36f5bee0a41b7ad971905d7d1c0e67433
