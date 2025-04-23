import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
//   secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendDemoBookedEmail = async (email, name, preferredTimeSlot, preferredDate) => {
  const mailOptions = {
    from: `"PGR - Virtual Trading App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Demo Booking Successful',

// html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <h2 style="color: #4CAF50;">Dear ${name},</h2>
//         <p>Your product demo has been successfuly booked.</p>
//         <p style="font-weight: bold;">Here are your booking details:</p>
//         <ul style="list-style-type: none; padding: 0;">
//           <li><strong>Preferred Date:</strong> ${preferredDate}</li>
//           <li><strong>Preferred Time Slot:</strong> ${preferredTimeSlot || "No Time Slot Chosen"}</li>
//         </ul>
//         <p>If you have any queries or need assistance, feel free to reach out to us:</p>
//         <p>
//           📧 <a href="mailto:${process.env.EMAIL_USER}" style="color: #1a73e8;">pgr_tradingapp@gmail.com</a><br>
//           📞 <a href="tel:${process.env.PHONE}" style="color: #1a73e8;">${process.env.PHONE}</a>
//         </p>
//         <p>Thank you,<br><strong>Praedico Global Research</strong></p>
//       </div>
//     `,

html: `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .logo {
          height: 120px;
          width: 120px;
          object-fit: contain;
          border-radius: 50%;
          border: 2px solid #f4f4f4;
          margin: 0 auto 10px auto;
          display: block;
        }
        .header {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .content {
          font-size: 16px;
          color: #555;
          line-height: 1.6;
          text-align: left;
        }
        .content ul {
          list-style-type: none;
          padding: 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #777;
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        a {
          color: #1a73e8;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img
          src="https://res.cloudinary.com/dufmoqkie/image/upload/v1743314060/PGR_logo_refoho.jpg"
          alt="PGR Logo"
          class="logo"
        />
        <div class="header">PGR - Virtual Trading App</div>
        <div class="content">
          <h2 style="color: #4CAF50;">Dear ${name},</h2>
          <p>Your request to get A Product Demo has been successfully booked.</p>
          <p style="font-weight: bold;">Here are your booking details:</p>
          <ul>
            <li><strong>Preferred Date:</strong> ${preferredDate}</li>
            <li><strong>Preferred Time Slot:</strong> ${preferredTimeSlot || "No Time Slot Chosen"}</li>
          </ul>
          <p>If you have any queries or need assistance, feel free to reach out to us:</p>
          <p>
            📧 <a href="mailto:${process.env.EMAIL_USER}">PGR-Virtual Trading App</a><br>
            📞 <a href="tel:${process.env.PHONE}">${process.env.PHONE}</a>
          </p>
          <p>Thank you,<br><strong>Praedico Global Research</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} PGR - Virtual Trading App. All rights reserved.
        </div>
      </div>
    </body>
  </html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } 
  catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending demo booking email');
  }
};

export const demoCompletedSuccessfulyEmail = async (email, name, preferredDate) => {
  const mailOptions = {
    from: `"PGR - Virtual Trading App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Product Demo Completed Successfuly',

html: `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .logo {
          height: 120px;
          width: 120px;
          object-fit: contain;
          border-radius: 50%;
          border: 2px solid #f4f4f4;
          margin: 0 auto 10px auto;
          display: block;
        }
        .header {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .content {
          font-size: 16px;
          color: #555;
          line-height: 1.6;
          text-align: left;
        }
        .content ul {
          list-style-type: none;
          padding: 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #777;
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        a {
          color: #1a73e8;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img
          src="https://res.cloudinary.com/dufmoqkie/image/upload/v1743314060/PGR_logo_refoho.jpg"
          alt="PGR Logo"
          class="logo"
        />
        <div class="header">PGR - Virtual Trading App</div>
        <div class="content">
          <h2 style="color: #4CAF50;">Dear ${name},</h2>
          <p>You have successfuly got A Product Demo of PGR - Virtual Trading App on ${preferredDate}.</p><br/>
          <p>If you have any queries or need assistance, feel free to reach out to us:</p>
          <p>
            📧 <a href="mailto:${process.env.EMAIL_USER}">PGR-Virtual Trading App</a><br>
            📞 <a href="tel:${process.env.PHONE}">${process.env.PHONE}</a>
          </p>
          <p>Thank you,<br><strong>Praedico Global Research</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} PGR - Virtual Trading App. All rights reserved.
        </div>
      </div>
    </body>
  </html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } 
  catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending demo completed successfuly email');
  }
};