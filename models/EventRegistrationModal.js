// import mongoose from "mongoose";

// const eventRegistrationSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   eventId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Event",
//     required: true,
//   },
//   paymentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Payment",
//   },
//   paymentOrderId: {
//     type: String // For Razorpay order ID
//   },
//   registrationDate: {
//     type: Date,
//     default: Date.now,
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "Registered", "Cancelled", "Completed"],
//     default: "Pending",
//   },
//   entryFee: {
//     type: Number,
//     required: true,
//   },
//   paymentStatus: {
//     type: String,
//     enum: ["Pending", "Completed", "Failed", "Refunded"],
//     default: "Pending"
//   },
//   attended: {
//     type: Boolean,
//     default: false
//   },
//   position: Number,
//   rewardReceived: Boolean
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Indexes
// eventRegistrationSchema.index({ userId: 1 });
// eventRegistrationSchema.index({ eventId: 1 });
// eventRegistrationSchema.index({ status: 1 });
// eventRegistrationSchema.index({ paymentStatus: 1 });

// export default mongoose.model("EventRegistration", eventRegistrationSchema);


import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  paymentOrderId: {
    type: String // For Razorpay order ID
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Registered", "Cancelled", "Completed"],
    default: "Pending",
  },
  entryFee: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending"
  },
  attended: {
    type: Boolean,
    default: false
  },
  position: Number,
  rewardReceived: Boolean,
  certificateId: {
    type: String,
    unique: true,
    default: function() {
      // Generate a unique certificate ID when a new registration is created
      return `CERT-${this._id.toString().slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
eventRegistrationSchema.index({ userId: 1 });
eventRegistrationSchema.index({ eventId: 1 });
eventRegistrationSchema.index({ status: 1 });
eventRegistrationSchema.index({ paymentStatus: 1 });
eventRegistrationSchema.index({ certificateId: 1 }, { unique: true });

export default mongoose.model("EventRegistration", eventRegistrationSchema);