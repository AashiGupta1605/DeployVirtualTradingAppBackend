import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron'
import DemoReqByOrganizationModal from '../models/DemoReqByOrganizationModal.js'
import DemoReqByUserModal from '../models/DemoReqByUserModal.js'

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const DemoBookedRemainderEmailTask = async () => {
    console.log("Hello, this is a DemoBookedRemainderEmailTask scheduled by chron job....")
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

        const orgDemos = await DemoReqByOrganizationModal.find({
            preferredDate: {
                $gte: tomorrow,
                $lt: dayAfterTomorrow,
            },
            isResolved:false
        });

        const userDemos = await DemoReqByUserModal.find({
            preferredDate: {
                $gte: tomorrow,
                $lt: dayAfterTomorrow,
            },
            isResolved:false
        });

        const allDemoRequests = [...orgDemos, ...userDemos]

        for (const data of allDemoRequests){
            const mailOptions = {
                from: `"PGR - Virtual Trading App" <${process.env.EMAIL_USER}>`,
                to: data.email,
                subject: 'Remainder!! Your Product Demo is scheduled for today.',
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
                        <h2 style="color: #4CAF50;">Dear ${data.name},</h2>
                        <p>This is a reminder, that you scheduled to Get A Product Demo is for today.</p>
                        <p style="font-weight: bold;">Here are your booking details:</p>
                        <ul>
                        <li><strong>Preferred Date:</strong> ${data.preferredDate}</li>
                        <li><strong>Preferred Time Slot:</strong> ${data.preferredTimeSlot || "No Time Slot Chosen"}</li>
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

            await transporter.sendMail(mailOptions)
            console.log(`Reminder email sent to ${data.email}`);
        }
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending Product Demo Remainder Email');
    }
};

// cron.schedule("30 20 * * *", async () => { await DemoBookedRemainderEmailTask();});
cron.schedule("0 20 * * *", () => {
    DemoBookedRemainderEmailTask()
        .then(() => console.log("DemoBookedRemainderEmailTask executed successfully."))
        .catch(err => console.error("Error in scheduled task:", err));
});

const DemoNotSuccessEmailTask = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const orgDemos = await DemoReqByOrganizationModal.find({
            preferredDate: {
                $gte: today,
                $lt: tomorrow,
            },
            isResolved:false
        });

        const userDemos = await DemoReqByUserModal.find({
            preferredDate: {
                $gte: today,
                $lt: tomorrow,
            },
            isResolved:false
        });

        const allDemoRequests = [...orgDemos, ...userDemos]

        for (const data of allDemoRequests){
            const mailOptions = {
                from: `"PGR - Virtual Trading App" <${process.env.EMAIL_USER}>`,
                to: data.email,
                subject: 'Oops! Looks Like Your Demo Was Missed — Lets Reschedule?',
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
                        <h2 style="color: #4CAF50;">Dear ${data.name},</h2>
                        <p>We noticed!! Your scheduled demo has been missed today—no worries!!</p>
                        <p>Your product demo has been rescheduled for tomorrow. If that doesn't work for you, feel free to reschedule it at a time that suits you the best.</p>
                        <!--<p>Your product demo has been rescheduled for tomorrow. If this timing is not convenient, you're welcome to reschedule it at your preferred time.</p>-->
                        <p style="font-weight: semibold;">Click below to easily reschedule at your convenience.</p>
                        <p style="font-weight: bold;">Here are your previous booking details:</p>
                        <ul>
                        <li><strong>Preferred Date:</strong> ${data.preferredDate}</li>
                        <li><strong>Preferred Time Slot:</strong> ${data.preferredTimeSlot || "No Time Slot Chosen"}</li>
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

            await transporter.sendMail(mailOptions)
            console.log(`Reminder email sent to ${data.email}`);
        }
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending Product Demo Remainder Email');
    }
};

cron.schedule("0 20 * * *", async () => {await DemoNotSuccessEmailTask();});