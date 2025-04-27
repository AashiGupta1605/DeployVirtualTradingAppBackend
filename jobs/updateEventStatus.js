// jobs/updateEventStatus.js
import cron from 'node-cron';
import EventRegistration from '../models/EventRegistrationModal.js'; // Adjust path if needed
import Event from '../models/EventModal.js'; // Adjust path if needed
import mongoose from 'mongoose';

const updateExpiredEventRegistrations = async () => {
  console.log('Running cron job: Checking for completed events...');
  const now = new Date();

  try {
    // Find IDs of events that have ended but are not marked as deleted
    const endedEventIds = await Event.find({
      endDate: { $lte: now }, // Event end date is less than or equal to now
      isDeleted: false // Ensure the event itself wasn't deleted
    }).select('_id'); // Only fetch the IDs

    if (!endedEventIds || endedEventIds.length === 0) {
      console.log('Cron job: No events found that ended recently.');
      return;
    }

    // Extract just the IDs
    const eventIds = endedEventIds.map(event => event._id);

    // Find registrations for these ended events that are still 'Registered'
    const result = await EventRegistration.updateMany(
      {
        eventId: { $in: eventIds }, // Belongs to one of the ended events
        status: 'Registered'        // Currently marked as Registered
      },
      {
        $set: { status: 'Completed' } // Update status to Completed
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Cron job: Successfully updated ${result.modifiedCount} registrations to 'Completed'.`);
    } else {
      console.log('Cron job: No registrations needed updating.');
    }

  } catch (error) {
    console.error('Cron job error: Failed to update event registration statuses:', error);
  }
};

// Schedule the job to run, for example, every hour
// You can adjust the schedule ('0 * * * *' means at the start of every hour)
// '0 0 * * *' would run once daily at midnight
// '*/30 * * * *' would run every 30 minutes
// const scheduleEventStatusUpdate = () => {
//   cron.schedule('0 * * * *', updateExpiredEventRegistrations, {
//     scheduled: true,
//     timezone: "UTC" // Or your server's timezone, e.g., "Asia/Kolkata"
//   });

//   console.log('Event status update cron job scheduled to run every hour.');

//   // Optional: Run once immediately when the server starts
//   // console.log('Running initial event status update check...');
//   // updateExpiredEventRegistrations();
// };

const scheduleEventStatusUpdate = () => {
    // Cron pattern for every minute: '* * * * *'
    cron.schedule('* * * * *', updateExpiredEventRegistrations, {
      scheduled: true,
      timezone: "UTC" // Or your server's timezone, e.g., "Asia/Kolkata"
    });
  
    console.log('Event status update cron job scheduled to run EVERY MINUTE.'); // Updated log message
  
    // Optional: Run once immediately when the server starts (keep if needed)
    // console.log('Running initial event status update check...');
    // updateExpiredEventRegistrations();
  };

export default scheduleEventStatusUpdate;