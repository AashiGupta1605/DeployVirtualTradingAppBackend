import dotenv from "dotenv";
dotenv.config();

// utils/sendOtp.js
import OtpVerification from "../models/OtpVerification.js";
import sendEmail from "./emailController.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (email) => {
  const otp = generateOtp();
  console.log("Generated OTP:", otp);

  await OtpVerification.deleteMany({ email });
  console.log("Old OTPs deleted");

  await OtpVerification.create({ email, otp });
  console.log("New OTP saved to DB");

  const subject = "OTP Verification";
  const message = `Your OTP for registration is <b>${otp}</b>. It is valid for 10 minutes. Please do not share it with anyone.`;

  await sendEmail(email, subject, message, "", "", false);
  console.log("OTP Email sent!");
};

export default sendOtp;
