// // import mongoose from "mongoose";

// <<<<<<< HEAD
// const FeedbackSchema = new mongoose.Schema({
//     userId: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: "User", 
//         required: true 
//     },
//     feedbackCategory: {
//         type: String,
//         enum: [
//             "Website UI/UX",
//             "Trading Features",
//             "Data Accuracy",
//             "Performance & Speed",
//             "Customer Support",
//             "Other"
//         ],
//         required: true,
//     },
//     feedbackMessage: { type: String, required: true },
//     rating: { type: Number, min: 1, max: 5, required: true },
//     recommend: { type: Boolean, required: true },
//     suggestions: { type: String, default: "" },
//     status: { 
//         type: String, 
//         enum: ['approved', 'rejected'],
//         default: 'approved' 
//     },
//     isDeleted: { type: Boolean, default: false },
//     createdDate: { type: Date, default: Date.now },
//     updatedDate: { type: Date, default: Date.now }
// });

// const Feedback = mongoose.model("Feedback", FeedbackSchema);
// export default Feedback;

// =======
// // // models/FeedbackModal.js
// // const FeedbackSchema = new mongoose.Schema({
// //     userId: { 
// //         type: mongoose.Schema.Types.ObjectId, 
// //         ref: "User", 
// //         required: true 
// //     },
// //     feedbackCategory: {
// //         type: String,
// //         enum: [
// //             "Website UI/UX",
// //             "Trading Features",
// //             "Data Accuracy",
// //             "Performance & Speed",
// //             "Customer Support",
// //             "Other"
// //         ],
// //         required: true,
// //     },
// //     feedbackMessage: { type: String, required: true },
// //     rating: { type: Number, min: 1, max: 5, required: true },
// //     recommend: { type: Boolean, required: true },
// //     suggestions: { type: String, default: "" },
// //     status: { 
// //         type: String, 
// //         enum: ['approved', 'rejected'],
// //         default: 'approved' 
// //     },
// //     isDeleted: { type: Boolean, default: false },
// //     createdDate: { type: Date, default: Date.now },
// //     updatedDate: { type: Date, default: Date.now }
// // });

// // const Feedback = mongoose.model("Feedback", FeedbackSchema);
// // export default Feedback;
// >>>>>>> 1419129f34fbf700c6f9266c11bd92cd269c3280
