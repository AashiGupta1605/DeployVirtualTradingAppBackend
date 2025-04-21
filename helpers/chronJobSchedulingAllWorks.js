import cron from 'node-cron'

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("DB connected for cron"))
.catch(err => console.log(err));

import DemoReqByOrganizationModal from '../models/DemoReqByOrganizationModal.js'
import DemoReqByUserModal from '../models/DemoReqByUserModal.js'

const DemoBookingCancelledTask = async()=>{
    console.log('⏳ Running cron job to cancel unresolved demo requests older than 7 days...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
        const orgResult = await DemoReqByOrganizationModal.updateMany(
            {
                isResolved: false,
                isCancelled: false,
                demoRequestDate: { $lte: sevenDaysAgo }
            },
            { $set: { isCancelled: true } }
        );
        const userResult = await DemoReqByUserModal.updateMany(
            {
                isResolved: false,
                isCancelled: false,
                demoRequestDate: { $lte: sevenDaysAgo }
            },
            { $set: { isCancelled: true } }
        );
        console.log(`${orgResult.modifiedCount} organization demo request(s) marked as cancelled.`);
        console.log(`${userResult.modifiedCount} user demo request(s) marked as cancelled.`);
    } 
    catch (error) {
        console.error('Error updating demo requests:', error);
    }
}

cron.schedule('0 0 * * *', async () => {
    try {
        await DemoBookingCancelledTask();
        console.log("DemoBookingCancelledTask executed successfully.");
    } 
    catch (err) {
        console.error("Error in scheduled DemoBookingCancelledTask:", err);
    }
});