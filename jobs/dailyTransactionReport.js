// // jobs/dailyTransactionReport.js
// import cron from 'node-cron';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import moment from 'moment-timezone';

// // Import Models (adjust paths as needed)
// import Transaction from '../models/TransactionModal.js';
// import User from '../models/UserModal.js';

// // Import Services/Controllers
// import sendEmail from '../utils/emailController.js'; // Use your controller
// import generateTransactionPDF from '../services/pdfService.js';

// dotenv.config();

// const CRON_SCHEDULE = '0 16 * * 1-5'; // Default: 4 PM Mon-Fri
// const TIMEZONE = 'Asia/Kolkata'; // Default timezone
// const FRONTEND_URL = 'http://http://localhost:5173'; // Fallback frontend URL

// console.log(`Scheduling daily transaction report job with schedule "${CRON_SCHEDULE}" in timezone "${TIMEZONE}"`);

// const runDailyReport = async () => {
//     const jobStartTime = moment().tz(TIMEZONE);
//     console.log(`[${jobStartTime.format()}] Running daily transaction report job...`);

//     try {
//         // 1. Define Time Range for the current day in the specified timezone
//         const now = moment().tz(TIMEZONE);
//         const reportDate = now.toDate(); // Date for the report title/filename

//         // Get start of the day to base calculations on
//         const startOfDay = now.clone().startOf('day');

//         // 9:30 AM market open time
//         const startTime = startOfDay.clone().set({ hour: 9, minute: 30, second: 0, millisecond: 0 }).toDate();
//         // 3:30 PM market close time
//         const endTime = startOfDay.clone().set({ hour: 15, minute: 30, second: 0, millisecond: 0 }).toDate();

//         console.log(`Fetching transactions between ${moment(startTime).tz(TIMEZONE).format()} and ${moment(endTime).tz(TIMEZONE).format()}`);

//         // 2. Fetch Completed Transactions within the time range
//         const transactions = await Transaction.find({
//             createdAt: { // Assuming createdAt reflects the execution time
//                 $gte: startTime,
//                 $lte: endTime // Include transactions exactly at 3:30:00 PM
//             },
//             status: 'completed' // Ensure we only report completed transactions
//         })
//         .populate('userId', 'name email') // Fetch user name and email
//         .sort({ userId: 1, createdAt: 1 }); // Sort for grouping and chronological order

//         if (!transactions || transactions.length === 0) {
//             console.log("No completed transactions found for the specified period.");
//             return; // Exit job if nothing to report
//         }

//         console.log(`Found ${transactions.length} completed transactions.`);

//         // 3. Group Transactions by User
//         const transactionsByUser = transactions.reduce((acc, tx) => {
//             // Skip transactions without a valid user ID or populated user
//             if (!tx.userId || !tx.userId._id) {
//                 console.warn(`Transaction ${tx._id} missing valid userId or population failed, skipping.`);
//                 return acc;
//             }
//             const userIdString = tx.userId._id.toString();
//             if (!acc[userIdString]) {
//                 acc[userIdString] = {
//                     user: tx.userId, // Store the populated user object { _id, name, email }
//                     list: []
//                 };
//             }
//             acc[userIdString].list.push(tx);
//             return acc;
//         }, {});

//         console.log(`Grouped transactions for ${Object.keys(transactionsByUser).length} users.`);

//         // 4. Generate PDF and Send Email for each user
//         for (const userIdString in transactionsByUser) {
//             const userData = transactionsByUser[userIdString];
//             const user = userData.user;
//             const userTransactions = userData.list;

//             // Double check if user details are present
//             if (!user || !user.email) {
//                 console.warn(`User data or email missing for userId ${userIdString}, skipping email for this user.`);
//                 continue; // Skip to the next user
//             }

//             const userName = user.name || 'Valued User'; // Use name or a fallback
//             const userEmail = user.email;

//             console.log(`Processing report for user: ${userName} (${userEmail})`);

//             try {
//                 // Generate PDF
//                 const pdfBuffer = await generateTransactionPDF(userTransactions, userName, reportDate, TIMEZONE);

//                 // Prepare Email using your controller's parameters
//                 const reportDateFormatted = moment(reportDate).tz(TIMEZONE).format('YYYY-MM-DD');
//                 const subject = `Your PGR Trading Report - ${reportDateFormatted}`;
//                 const message = `
//                     Please find attached your transaction report for ${reportDateFormatted}.<br><br>
//                     This includes completed trades executed between 9:30 AM and 3:30 PM (${TIMEZONE}).<br><br>
//                     You can view your portfolio and history on the platform.
//                 `; // Main text for the email body

//                 const attachments = [{
//                     filename: `PGR_Transaction_Report_${userName.replace(/\s+/g, '_')}_${reportDateFormatted}.pdf`,
//                     content: pdfBuffer,
//                     contentType: 'application/pdf'
//                 }];

//                 // Send Email using your emailController's sendEmail function
//                 await sendEmail(
//                     userEmail,
//                     subject,
//                     message,
//                     attachments, // Pass the attachments array
//                     "",          // No specific button text needed here
//                     "",          // No specific button link needed here
//                     true         // Show the default "Go to Home" link
//                 );

//             } catch (error) {
//                 // Log error for specific user but continue with others
//                 console.error(`Failed to generate PDF or send email for user ${userEmail}:`, error);
//             }
//         } // End of user loop

//         console.log(`Daily transaction report job finished at ${moment().tz(TIMEZONE).format()}.`);

//     } catch (error) {
//         // Log error for the overall job execution
//         console.error("Critical error running the daily transaction report job:", error);
//     }
// };

// // Schedule the job using node-cron
// const scheduledJob = cron.schedule(CRON_SCHEDULE, runDailyReport, {
//     scheduled: true,
//     timezone: TIMEZONE // Crucial for accurate scheduling
// });

// // Log the next scheduled run time
// try {
//      const nextRun = scheduledJob.nextDates().toDate();
//      console.log(`Job scheduled. Next run time: ${moment(nextRun).tz(TIMEZONE).format()} (${TIMEZONE})`);
// } catch(e){
//      console.error("Could not determine next run time for cron job.", e);
// }


// // Optional: Run once immediately on startup for testing (uncomment if needed)
// // console.log("Running report immediately for testing...");
// // runDailyReport().then(() => console.log("Manual test run finished.")).catch(err => console.error("Manual test run failed:", err));


// export default scheduledJob; // Export if needed elsewhere

// jobs/dailyTransactionReport.js
import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import moment from 'moment-timezone';

// Import Models (adjust paths as needed)
// Ensure these paths and filenames are correct
import Transaction from '../models/TransactionModal.js';
import User from '../models/UserModal.js';

// Import Services/Controllers
import sendEmail from '../utils/emailController.js'; // Use your controller
import generateTransactionPDF from '../services/pdfService.js'; // Ensure path is correct

dotenv.config();

const CRON_SCHEDULE = '15 16 * * 1-5'; // Use env var or default
const TIMEZONE = 'Asia/Kolkata'; // Use env var or default
// Ensure FRONTEND_URL is correct in your .env or here
const FRONTEND_URL = 'http://localhost:5173';

console.log(`Scheduling daily transaction report job with schedule "${CRON_SCHEDULE}" in timezone "${TIMEZONE}"`);

const runDailyReport = async () => {
    const jobStartTime = moment().tz(TIMEZONE);
    console.log(`[${jobStartTime.format()}] Running daily transaction report job...`);

    try {
        // 1. Define Time Range
        const now = moment().tz(TIMEZONE);
        const reportDate = now.toDate();
        const startOfDay = now.clone().startOf('day');
        const startTime = startOfDay.clone().set({ hour: 9, minute: 30, second: 0, millisecond: 0 }).toDate();
        const endTime = startOfDay.clone().set({ hour: 15, minute: 30, second: 0, millisecond: 0 }).toDate();

        console.log(`Fetching transactions between ${moment(startTime).tz(TIMEZONE).format()} and ${moment(endTime).tz(TIMEZONE).format()}`);

        // 2. Fetch Transactions
        const transactions = await Transaction.find({
            createdAt: { $gte: startTime, $lte: endTime },
            status: 'completed'
        })
        .populate('userId', 'name email')
        .sort({ userId: 1, createdAt: 1 });

        if (!transactions || transactions.length === 0) {
            console.log("No completed transactions found for the specified period.");
            return;
        }

        console.log(`Found ${transactions.length} completed transactions.`);

        // 3. Group Transactions
        const transactionsByUser = transactions.reduce((acc, tx) => {
            if (!tx.userId || !tx.userId._id) {
                console.warn(`Transaction ${tx._id} missing valid userId or population failed, skipping.`);
                return acc;
            }
            const userIdString = tx.userId._id.toString();
            if (!acc[userIdString]) {
                acc[userIdString] = { user: tx.userId, list: [] };
            }
            acc[userIdString].list.push(tx);
            return acc;
        }, {});

        console.log(`Grouped transactions for ${Object.keys(transactionsByUser).length} users.`);

        // 4. Generate PDF and Send Email
        for (const userIdString in transactionsByUser) {
            const userData = transactionsByUser[userIdString];
            const user = userData.user;
            const userTransactions = userData.list;

            if (!user || !user.email) {
                console.warn(`User data or email missing for userId ${userIdString}, skipping email for this user.`);
                continue;
            }

            const userName = user.name || 'Valued User';
            const userEmail = user.email;

            console.log(`Processing report for user: ${userName} (${userEmail})`);

            try {
                const pdfBuffer = await generateTransactionPDF(userTransactions, userName, reportDate, TIMEZONE);
                const reportDateFormatted = moment(reportDate).tz(TIMEZONE).format('YYYY-MM-DD');
                const subject = `Your PGR Trading Report - ${reportDateFormatted}`;
                const message = `
                    Please find attached your transaction report for ${reportDateFormatted}.<br><br>
                    This includes completed trades executed between 9:30 AM and 3:30 PM (${TIMEZONE}).<br><br>
                    You can view your portfolio and history on the platform.
                `;
                const attachments = [{
                    filename: `PGR_Transaction_Report_${userName.replace(/\s+/g, '_')}_${reportDateFormatted}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }];

                await sendEmail(
                    userEmail,
                    subject,
                    message,
                    attachments,
                    "", // buttonText
                    "", // buttonLink
                    true // showHomeLink
                );

            } catch (error) {
                console.error(`Failed to generate PDF or send email for user ${userEmail}:`, error);
            }
        }

        console.log(`Daily transaction report job finished at ${moment().tz(TIMEZONE).format()}.`);

    } catch (error) {
        console.error("Critical error running the daily transaction report job:", error);
    }
};

// Schedule the job using node-cron
// Assign the result to a variable (e.g., task)
const task = cron.schedule(CRON_SCHEDULE, runDailyReport, {
    scheduled: true,
    timezone: TIMEZONE
});

// Log the next scheduled run time safely
try {
    // Check if the task object is valid and has the method
    if (task && typeof task.nextDates === 'function') {
         // Get the next single date object (may vary slightly by node-cron version)
        const nextRunDate = task.nextDates(1)[0];

        if (nextRunDate) {
            // Convert to Date object if it's not already (e.g., if it's a Luxon DateTime)
            // Moment can usually handle various date object types.
            console.log(`Job scheduled. Next run time: ${moment(nextRunDate.toDate ? nextRunDate.toDate() : nextRunDate).tz(TIMEZONE).format()} (${TIMEZONE})`);
        } else {
             console.warn("Could not retrieve next run time using task.nextDates(1)[0].");
        }
    } else {
        console.warn("Cron task object is invalid or missing 'nextDates' method.");
    }
} catch (e) {
    console.error("Error occurred while trying to get next run time for cron job:", e);
}

// Optional: Run once immediately on startup for testing
// console.log("Running report immediately for testing...");
// runDailyReport().then(() => console.log("Manual test run finished.")).catch(err => console.error("Manual test run failed:", err));

// Export the task object itself if you need to control it (start/stop) elsewhere
export default task;