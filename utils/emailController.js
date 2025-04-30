// import nodemailer from "nodemailer";
// import generateEmailTemplate from "./emailTemplate.js";
// import dotenv from 'dotenv';
// dotenv.config();


// const sendEmail = async (to, subject, message, buttonText = "", buttonLink = "", showHomeLink = true) => {
//   try {
//     let transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER, // Your Email
//         pass: process.env.EMAIL_PASSWORD // Your App Password
//       },
//     });

//     let mailOptions = {
//       from: `"PGR - Virtual Trading App" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html: generateEmailTemplate({ subject, message ,buttonText, buttonLink , showHomeLink }),
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${to}`);
//   } catch (error) {
//     console.error(` Error sending email: ${error}`);
//   }
// };

// export default sendEmail;


// controllers/emailController.js
import nodemailer from "nodemailer";
import generateEmailTemplate from "./emailTemplate.js"; // Assuming it's in the same directory
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (
    to,
    subject,
    message, // This will be the main text content for the HTML body
    attachments = [], // <-- Add attachments parameter, default to empty array
    buttonText = "",
    buttonLink = "",
    showHomeLink = true
) => {
    try {
        // Input validation (basic example)
        if (!to || !subject || !message) {
            throw new Error("Missing required email parameters: to, subject, message");
        }
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
             console.error("Email credentials (EMAIL_USER, EMAIL_PASSWORD) not found in .env");
             throw new Error("Email service not configured properly.");
        }

        let transporter = nodemailer.createTransport({
            service: "gmail", // Make sure this matches your provider if not Gmail
            auth: {
                user: process.env.EMAIL_USER, // Your Email
                pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
            },
            // Optional: Add connection timeout if needed
            // connectionTimeout: 5 * 60 * 1000, // 5 minutes
        });

        // Generate the HTML body using your template
        const htmlBody = generateEmailTemplate({
            subject,
            message,
            buttonText,
            buttonLink,
            showHomeLink
        });

        let mailOptions = {
            from: `"PGR - Virtual Trading App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlBody, // Use the generated HTML
            attachments: attachments // <-- Pass the attachments array here
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
        return info; // Return info for potential logging or tracking

    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        // Optionally re-throw or handle differently depending on application flow
        // throw error;
    }
};

export default sendEmail;