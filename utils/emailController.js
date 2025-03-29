import nodemailer from "nodemailer";
import generateEmailTemplate from "./emailTemplate.js";
import dotenv from 'dotenv';
dotenv.config();


const sendEmail = async (to, subject, message) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Email
        pass: process.env.EMAIL_PASSWORD // Your App Password
      },
    });

    let mailOptions = {
      from: `"PGR - Virtual Trading Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: generateEmailTemplate({ subject, message }),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending email: ${error}`);
  }
};

export default sendEmail;
