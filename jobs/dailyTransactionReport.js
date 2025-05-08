

// // jobs/dailyTransactionReport.js
// import cron from 'node-cron';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import moment from 'moment-timezone';

// // Import Models (adjust paths as needed)
// // Ensure these paths and filenames are correct
// import Transaction from '../models/TransactionModal.js';
// import User from '../models/UserModal.js';

// // Import Services/Controllers
// import sendEmail from '../utils/emailController.js'; // Use your controller
// import generateTransactionPDF from '../services/pdfService.js'; // Ensure path is correct

// dotenv.config();

// const CRON_SCHEDULE = '15 16 * * 1-5'; // Use env var or default
// const TIMEZONE = 'Asia/Kolkata'; // Use env var or default
// // Ensure FRONTEND_URL is correct in your .env or here
// const FRONTEND_URL = 'http://localhost:5173';

// console.log(`Scheduling daily transaction report job with schedule "${CRON_SCHEDULE}" in timezone "${TIMEZONE}"`);

// const runDailyReport = async () => {
//     const jobStartTime = moment().tz(TIMEZONE);
//     console.log(`[${jobStartTime.format()}] Running daily transaction report job...`);

//     try {
//         // 1. Define Time Range
//         const now = moment().tz(TIMEZONE);
//         const reportDate = now.toDate();
//         const startOfDay = now.clone().startOf('day');
//         const startTime = startOfDay.clone().set({ hour: 9, minute: 30, second: 0, millisecond: 0 }).toDate();
//         const endTime = startOfDay.clone().set({ hour: 15, minute: 30, second: 0, millisecond: 0 }).toDate();

//         console.log(`Fetching transactions between ${moment(startTime).tz(TIMEZONE).format()} and ${moment(endTime).tz(TIMEZONE).format()}`);

//         // 2. Fetch Transactions
//         const transactions = await Transaction.find({
//             createdAt: { $gte: startTime, $lte: endTime },
//             status: 'completed'
//         })
//         .populate('userId', 'name email')
//         .sort({ userId: 1, createdAt: 1 });

//         if (!transactions || transactions.length === 0) {
//             console.log("No completed transactions found for the specified period.");
//             return;
//         }

//         console.log(`Found ${transactions.length} completed transactions.`);

//         // 3. Group Transactions
//         const transactionsByUser = transactions.reduce((acc, tx) => {
//             if (!tx.userId || !tx.userId._id) {
//                 console.warn(`Transaction ${tx._id} missing valid userId or population failed, skipping.`);
//                 return acc;
//             }
//             const userIdString = tx.userId._id.toString();
//             if (!acc[userIdString]) {
//                 acc[userIdString] = { user: tx.userId, list: [] };
//             }
//             acc[userIdString].list.push(tx);
//             return acc;
//         }, {});

//         console.log(`Grouped transactions for ${Object.keys(transactionsByUser).length} users.`);

//         // 4. Generate PDF and Send Email
//         for (const userIdString in transactionsByUser) {
//             const userData = transactionsByUser[userIdString];
//             const user = userData.user;
//             const userTransactions = userData.list;

//             if (!user || !user.email) {
//                 console.warn(`User data or email missing for userId ${userIdString}, skipping email for this user.`);
//                 continue;
//             }

//             const userName = user.name || 'Valued User';
//             const userEmail = user.email;

//             console.log(`Processing report for user: ${userName} (${userEmail})`);

//             try {
//                 const pdfBuffer = await generateTransactionPDF(userTransactions, userName, reportDate, TIMEZONE);
//                 const reportDateFormatted = moment(reportDate).tz(TIMEZONE).format('YYYY-MM-DD');
//                 const subject = `Your PGR Trading Report - ${reportDateFormatted}`;
//                 const message = `
//                     Please find attached your transaction report for ${reportDateFormatted}.<br><br>
//                     This includes completed trades executed between 9:30 AM and 3:30 PM (${TIMEZONE}).<br><br>
//                     You can view your portfolio and history on the platform.
//                 `;
//                 const attachments = [{
//                     filename: `PGR_Transaction_Report_${userName.replace(/\s+/g, '_')}_${reportDateFormatted}.pdf`,
//                     content: pdfBuffer,
//                     contentType: 'application/pdf'
//                 }];

//                 await sendEmail(
//                     userEmail,
//                     subject,
//                     message,
//                     attachments,
//                     "", // buttonText
//                     "", // buttonLink
//                     true // showHomeLink
//                 );

//             } catch (error) {
//                 console.error(`Failed to generate PDF or send email for user ${userEmail}:`, error);
//             }
//         }

//         console.log(`Daily transaction report job finished at ${moment().tz(TIMEZONE).format()}.`);

//     } catch (error) {
//         console.error("Critical error running the daily transaction report job:", error);
//     }
// };

// // Schedule the job using node-cron
// // Assign the result to a variable (e.g., task)
// const task = cron.schedule(CRON_SCHEDULE, runDailyReport, {
//     scheduled: true,
//     timezone: TIMEZONE
// });

// // Log the next scheduled run time safely
// try {
//     // Check if the task object is valid and has the method
//     if (task && typeof task.nextDates === 'function') {
//          // Get the next single date object (may vary slightly by node-cron version)
//         const nextRunDate = task.nextDates(1)[0];

//         if (nextRunDate) {
//             // Convert to Date object if it's not already (e.g., if it's a Luxon DateTime)
//             // Moment can usually handle various date object types.
//             console.log(`Job scheduled. Next run time: ${moment(nextRunDate.toDate ? nextRunDate.toDate() : nextRunDate).tz(TIMEZONE).format()} (${TIMEZONE})`);
//         } else {
//              console.warn("Could not retrieve next run time using task.nextDates(1)[0].");
//         }
//     } else {
//         console.warn("Cron task object is invalid or missing 'nextDates' method.");
//     }
// } catch (e) {
//     console.error("Error occurred while trying to get next run time for cron job:", e);
// }

// // Optional: Run once immediately on startup for testing
// // console.log("Running report immediately for testing...");
// // runDailyReport().then(() => console.log("Manual test run finished.")).catch(err => console.error("Manual test run failed:", err));

// // Export the task object itself if you need to control it (start/stop) elsewhere
// export default task;



// jobs/dailyTransactionReport.js
// import cron from 'node-cron';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import moment from 'moment-timezone';
// import path, { dirname } from 'path'; // <--- Import path
// import fs from 'fs';

// // Import Models
// import Transaction from '../models/TransactionModal.js';
// import User from '../models/UserModal.js';

// // Import Services/Controllers
// import sendEmail from '../utils/emailController.js';
// import generateTransactionPDF from '../services/pdfService.js';

// dotenv.config();

// // const CRON_SCHEDULE = '15 16 * * 1-5';
// const CRON_SCHEDULE = '27 20 * * 1-5';
// const TIMEZONE = 'Asia/Kolkata';

// // --- DEFINE COMPANY DETAILS ---
// // !!! IMPORTANT: ADJUST logoPath to the correct absolute or relative path
// // from where your script runs !!!
// const __dirname = path.resolve(path.dirname('')); // Gets the project root if run from root
// const companyDetails = {
//     name: "PGR - Virtual Trading App",
//     // Example: logo is in 'src/assets/images/PGR_logo_refoho.jpg' relative to project root
//     logoPath: path.resolve(__dirname, 'utils', 'img', 'PGR_logo.jpeg'), // ADJUST THIS PATH
//     email: "praedicoglobalresearch@gmail.com", // Replace with your actual email
//     phone: "+91-123-456-7890",   // Replace with your actual phone
// };
// // Check if logo exists at startup (optional but helpful)
// if (!fs.existsSync(companyDetails.logoPath)) {
//     console.warn(`[WARNING] Company logo not found at path: ${companyDetails.logoPath}. PDF logo will be missing.`);
// }
// // --- END COMPANY DETAILS ---


// console.log(`Scheduling daily transaction report job with schedule "${CRON_SCHEDULE}" in timezone "${TIMEZONE}"`);

// const runDailyReport = async () => {
//     const jobStartTime = moment().tz(TIMEZONE);
//     console.log(`[${jobStartTime.format()}] Running daily transaction report job...`);

//     try {
//         const now = moment().tz(TIMEZONE);
//         const reportDate = now.toDate();
//         const startOfDay = now.clone().startOf('day');
//         // Market hours specific to the timezone
//         const startTime = startOfDay.clone().set({ hour: 9, minute: 30, second: 0, millisecond: 0 }).toDate();
//         const endTime = startOfDay.clone().set({ hour: 15, minute: 30, second: 0, millisecond: 0 }).toDate();

//         console.log(`Fetching transactions between ${moment(startTime).tz(TIMEZONE).format()} and ${moment(endTime).tz(TIMEZONE).format()}`);

//         // 2. Fetch Transactions - Populate userId and eventId
//         const transactions = await Transaction.find({
//             createdAt: { $gte: startTime, $lte: endTime },
//             status: 'completed' // Assuming 'completed' means successful trade
//         })
//         // Populate user info needed for PDF (id, name, email)
//         .populate('userId', 'name email _id')
//         // Populate event info if transaction is linked to an event
//         // Assuming 'eventId' exists on Transaction and refers to an Event model with a 'title' field
//         .populate('eventId', 'title')
//         .sort({ userId: 1, createdAt: 1 }); // Sort by user, then time

//         if (!transactions || transactions.length === 0) {
//             console.log("No completed transactions found for the specified period.");
//             return;
//         }

//         console.log(`Found ${transactions.length} completed transactions.`);

//         // 3. Group Transactions by User
//         const transactionsByUser = transactions.reduce((acc, tx) => {
//             if (!tx.userId || !tx.userId._id) {
//                 console.warn(`Transaction ${tx._id} missing valid userId or population failed, skipping.`);
//                 return acc;
//             }
//             const userIdString = tx.userId._id.toString();
//             if (!acc[userIdString]) {
//                 // Store the full user object and the event object (if any) from the first transaction
//                 // This assumes all transactions for a user in this report belong to the same event (if any)
//                 // A more complex logic might be needed if a user trades in multiple events/contexts on the same day
//                 acc[userIdString] = {
//                     user: tx.userId,
//                     list: [],
//                     // Store event details from the first transaction of this user
//                     eventInfo: tx.eventId ? { name: tx.eventId.title, id: tx.eventId._id } : null
//                 };
//             }
//             acc[userIdString].list.push(tx);
//             return acc;
//         }, {});

//         console.log(`Grouped transactions for ${Object.keys(transactionsByUser).length} users.`);

//         // 4. Generate PDF and Send Email for each user
//         for (const userIdString in transactionsByUser) {
//             const userData = transactionsByUser[userIdString];
//             const user = userData.user; // Full user object { _id, name, email }
//             const userTransactions = userData.list;
//             const eventDetails = userData.eventInfo; // { name: eventName } or null

//             if (!user || !user.email || !user._id) { // Check for _id as well
//                 console.warn(`User data, email, or ID missing for userId ${userIdString}, skipping email for this user.`);
//                 continue;
//             }

//             const userName = user.name || 'Valued User';
//             const userEmail = user.email;

//             console.log(`Processing report for user: ${userName} (${userEmail}) ${eventDetails ? `(Event: ${eventDetails.name})` : ''}`);

//             try {
//                 // Generate PDF using the updated service function
//                 const pdfBuffer = await generateTransactionPDF(
//                     userTransactions,
//                     user, // Pass the full user object
//                     reportDate,
//                     TIMEZONE,
//                     companyDetails, // Pass company details
//                     eventDetails    // Pass event details (or null)
//                 );

//                 const reportDateFormatted = moment(reportDate).tz(TIMEZONE).format('YYYY-MM-DD');
//                 const subject = `Your PGR Trading Report - ${reportDateFormatted}${eventDetails ? ` - Event: ${eventDetails.name}` : ''}`;
//                 let message = `
//                     Dear ${userName},<br><br>
//                     Please find attached your transaction report for ${reportDateFormatted}.<br>
//                     This includes completed trades executed between 9:30 AM and 3:30 PM (${TIMEZONE}).<br>`;

//                 if (eventDetails) {
//                      message += `These transactions are associated with the event: <strong>${eventDetails.name}</strong>.<br>`;
//                 }

//                 message += `<br>You can view your complete portfolio and history on the platform.`;

//                 const attachments = [{
//                     filename: `PGR_Report_${userName.replace(/\s+/g, '_')}_${reportDateFormatted}.pdf`,
//                     content: pdfBuffer,
//                     contentType: 'application/pdf'
//                 }];

//                 await sendEmail(
//                     userEmail,
//                     subject,
//                     message,
//                     attachments,
//                     "", // buttonText
//                     "", // buttonLink
//                     true // showHomeLink
//                 );
//                 console.log(`Successfully sent report to ${userEmail}`);

//             } catch (error) {
//                 console.error(`Failed to generate PDF or send email for user ${userEmail}:`, error);
//                 // Consider adding more specific error logging or retry logic
//             }
//         }

//         console.log(`Daily transaction report job finished successfully at ${moment().tz(TIMEZONE).format()}.`);

//     } catch (error) {
//         console.error("Critical error running the daily transaction report job:", error);
//     }
// };

// // Schedule the job
// const task = cron.schedule(CRON_SCHEDULE, runDailyReport, {
//     scheduled: true,
//     timezone: TIMEZONE
// });

// // Log next run time
// try {
//     if (task && typeof task.nextDates === 'function') {
//         const nextRunDate = task.nextDates(1)[0]; // Get the next single date
//         if (nextRunDate) {
//             console.log(`Job scheduled. Next run time: ${moment(nextRunDate.toDate ? nextRunDate.toDate() : nextRunDate).tz(TIMEZONE).format()} (${TIMEZONE})`);
//         } else {
//              console.warn("Could not retrieve next run time.");
//         }
//     } else {
//         console.warn("Cron task object is invalid or missing 'nextDates' method.");
//     }
// } catch (e) {
//     console.error("Error getting next run time:", e);
// }

// // Optional: Immediate run for testing
// // console.log("Running report immediately for testing...");
// // runDailyReport().then(() => console.log("Manual test run finished.")).catch(err => console.error("Manual test run failed:", err));

// export default task;



// jobs/dailyTransactionReport.js
import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import path from 'path'; // Used for logo path resolution
import fs from 'fs';   // Used to check if logo exists

// Import Models
import Transaction from '../models/TransactionModal.js'; // Adjust path as needed
import User from '../models/UserModal.js'; // Adjust path as needed

// Import Services/Controllers
import sendEmail from '../utils/emailController.js'; // Adjust path as needed
import generateTransactionPDF from '../services/pdfService.js'; // Adjust path as needed

dotenv.config();

// Cron schedule for 8:27 PM (20:27) Monday to Friday OR Every Day
// Choose one:
const CRON_SCHEDULE = '07 16 * * 1-5'; // 8:27 PM Mon-Fri
// const CRON_SCHEDULE = '27 20 1-5';   // 8:27 PM Every Day

const TIMEZONE = 'Asia/Kolkata'; // Your specified timezone

// --- DEFINE COMPANY DETAILS ---
// !!! IMPORTANT: ADJUST logoPath to the correct absolute or relative path
// from where your script runs !!!
const __dirname = path.resolve(path.dirname('')); // Gets the project root (adjust if needed)
const companyDetails = {
    name: "PGR - Virtual Trading App", // Your Company Name
    // Example: logo is in 'project_root/utils/img/PGR_logo_refoho.jpg'
    logoPath: path.resolve(__dirname, 'utils', 'img', 'PGR_logo.jpeg'), // !!! ADJUST THIS PATH !!!
    email: "praedicoglobalresearch@gmail.com", // Replace with your actual email
    phone: "+91-123-456-7890"   // Replace with your actual phone
};

// Check if logo exists at startup (optional but helpful)
if (!fs.existsSync(companyDetails.logoPath)) {
    console.warn(`[Startup Warning] Company logo not found at path: ${companyDetails.logoPath}. PDF logo will be missing.`);
}
// --- END COMPANY DETAILS ---


console.log(`Scheduling daily transaction report job with schedule "${CRON_SCHEDULE}" in timezone "${TIMEZONE}"`);

const runDailyReport = async () => {
    const jobStartTime = moment().tz(TIMEZONE);
    console.log(`[${jobStartTime.format()}] Running daily transaction report job...`);

    try {
        const now = moment().tz(TIMEZONE);
        const reportDate = now.toDate(); // Use Date object for consistency
        const startOfDay = now.clone().startOf('day'); // Start of the current day in the specified timezone

        // Define market hours for the query
        const startTime = startOfDay.clone().set({ hour: 9, minute: 30, second: 0, millisecond: 0 }).toDate();
        const endTime = startOfDay.clone().set({ hour: 15, minute: 30, second: 0, millisecond: 0 }).toDate();

        console.log(`Fetching completed transactions between ${moment(startTime).tz(TIMEZONE).format()} and ${moment(endTime).tz(TIMEZONE).format()}`);

        // 2. Fetch Transactions - Populate necessary fields
        const transactions = await Transaction.find({
            createdAt: { $gte: startTime, $lte: endTime },
            status: 'completed' // Ensure only completed transactions
        })
        // Populate user info needed for PDF (id, name, email)
        .populate('userId', 'name email _id') // Include _id for PDF function
        // Populate event info if transaction is linked to an event
        // Assuming 'eventId' exists on Transaction and refers to an Event model with a 'title' field
        .populate('eventId', 'title') // Populate event title if applicable
        .sort({ userId: 1, createdAt: 1 }); // Sort by user, then time for grouping

        if (!transactions || transactions.length === 0) {
            console.log("No completed transactions found for the specified period. Job finished.");
            return; // Exit if no transactions
        }

        console.log(`Found ${transactions.length} completed transactions.`);

        // 3. Group Transactions by User
        const transactionsByUser = transactions.reduce((acc, tx) => {
            if (!tx.userId || !tx.userId._id) {
                console.warn(`Transaction ${tx._id} missing valid userId or population failed, skipping.`);
                return acc;
            }
            const userIdString = tx.userId._id.toString();
            if (!acc[userIdString]) {
                // Initialize user entry
                acc[userIdString] = {
                    user: tx.userId, // Store the full populated user object
                    list: [],
                    // Determine event details for this user group
                    // Simple approach: take event from the first transaction of the user in this batch
                    // Assumes user trades within one event context per report period
                    eventInfo: tx.eventId ? { name: tx.eventId.title, id: tx.eventId._id } : null
                };
            }
            acc[userIdString].list.push(tx);
            return acc;
        }, {});

        console.log(`Grouped transactions for ${Object.keys(transactionsByUser).length} users.`);

        // 4. Generate PDF and Send Email for each user
        for (const userIdString in transactionsByUser) {
            const userData = transactionsByUser[userIdString];
            const user = userData.user; // The populated user object
            const userTransactions = userData.list;
            const eventDetails = userData.eventInfo; // Event info object or null

            if (!user || !user.email || !user._id) { // Essential checks
                console.warn(`User data, email, or ID missing for entry associated with ID ${userIdString}. Skipping email.`);
                continue; // Skip this user if critical info is missing
            }

            const userName = user.name || 'Valued User';
            const userEmail = user.email;

            console.log(`Processing report for user: ${userName} (${userEmail}) ${eventDetails ? `(Event: ${eventDetails.name})` : '(No Event)'}`);

            try {
                // Generate PDF using the updated service function
                const pdfBuffer = await generateTransactionPDF(
                    userTransactions,
                    user, // Pass the full populated user object
                    reportDate,
                    TIMEZONE,
                    companyDetails, // Pass company details object
                    eventDetails    // Pass event details object (or null)
                );

                const reportDateFormatted = moment(reportDate).tz(TIMEZONE).format('YYYY-MM-DD');
                const subject = `Your PGR Trading Report - ${reportDateFormatted}${eventDetails ? ` - Event: ${eventDetails.name}` : ''}`;
                let message = `
                    Dear ${userName},<br><br>
                    Please find attached your transaction report for ${reportDateFormatted}.<br>
                    This includes completed trades executed between 9:30 AM and 3:30 PM (${TIMEZONE}).<br>`;

                if (eventDetails) {
                     message += `These transactions are associated with the event: <strong>${eventDetails.name}</strong>.<br>`;
                }

                message += `<br>You can view your complete portfolio and trading history on the platform.<br><br>Thank you for trading with ${companyDetails.name}.`;

                const attachments = [{
                    filename: `PGR_Report_${userName.replace(/\s+/g, '_')}_${reportDateFormatted}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }];

                // Send the email
                await sendEmail(
                    userEmail,
                    subject,
                    message,
                    attachments,
                    "", // buttonText (optional)
                    "", // buttonLink (optional)
                    true // showHomeLink (optional)
                );
                console.log(`Successfully generated PDF and sent report email to ${userEmail}`);

            } catch (error) {
                console.error(`Failed processing report for user ${userEmail} (ID: ${userIdString}):`, error);
                // Consider sending an alert or logging to a monitoring service
            }
        }

        console.log(`Daily transaction report job finished successfully at ${moment().tz(TIMEZONE).format()}.`);

    } catch (error) {
        console.error("Critical error running the daily transaction report job:", error);
        // Consider sending a critical alert
    }
};

// Schedule the job using node-cron
const task = cron.schedule(CRON_SCHEDULE, runDailyReport, {
    scheduled: true,
    timezone: TIMEZONE
});

// Log the next scheduled run time safely
try {
    if (task && typeof task.nextDates === 'function') {
        const nextRunDate = task.nextDates(1)[0]; // Get the next single date object
        if (nextRunDate) {
            // Convert to Date object if needed and format using moment-timezone
            const nextRunMoment = moment(nextRunDate.toDate ? nextRunDate.toDate() : nextRunDate).tz(TIMEZONE);
            console.log(`Job scheduled. Next run time: ${nextRunMoment.format('YYYY-MM-DD HH:mm:ss Z')} (${TIMEZONE})`);
        } else {
             console.warn("Could not retrieve next run time using task.nextDates().");
        }
    } else {
        console.warn("Cron task object is invalid or missing 'nextDates' method.");
    }
} catch (e) {
    console.error("Error occurred while trying to get next run time for cron job:", e);
}

// Optional: Uncomment to run once immediately on startup for testing
// console.log("Running report immediately for testing...");
// runDailyReport().then(() => console.log("Manual test run finished.")).catch(err => console.error("Manual test run failed:", err));

// Export the task object if needed elsewhere (e.g., for manual triggering or stopping)
export default task;