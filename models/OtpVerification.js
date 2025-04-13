// models/OtpVerification.js
import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires in 10 mins
  status: { type: String, enum: ["not approved", "approved"], default: "not approved" }
});

export default mongoose.model("OtpVerification", otpVerificationSchema);
