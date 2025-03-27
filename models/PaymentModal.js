// braintree payment gateway ---------

// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   subscriptionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SubscriptionPlan",
//     // required: true,
//   },
//   paymentMethod: {
//     type: String,
//     required: true,
//   },
//   amount: {
//     type: Number,
//     required: true,
//   },
//   transactionId: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "Completed", "Failed"],
//     default: "Pending",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export default mongoose.model("Payment", paymentSchema);



// razory pay

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["Razorpay", "Other"], // Add other payment methods if needed
    default: "Razorpay",
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Created", "Attempted", "Paid", "Failed", "Refunded"],
    default: "Created",
  },
  invoiceId: {
    type: String,
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed, // To store raw payment response
  },
  planName: {
    type: String, // Store plan name for easy reference
  },
  duration: {
    type: String, // Store duration for easy reference
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // This will automatically add createdAt and updatedAt fields
});

// Add index for better query performance
paymentSchema.index({ userId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });

// Add a method to verify payment signature
paymentSchema.methods.verifySignature = function(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  
  return expectedSignature === razorpaySignature;
};

export default mongoose.model("Payment", paymentSchema);