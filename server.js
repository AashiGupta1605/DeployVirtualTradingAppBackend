// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cron from 'node-cron';
import { scrapeAndStoreETFData } from './scripts/scraper2.js';
import { fetchNifty50Data } from './scripts/scraper.js';
import userRoute from "./routes/user/index.js";
import adminRoute from "./routes/admin/adminRoute.js";
<<<<<<< HEAD
import organizationRoute from "./routes/organization/organizationRoute.js"
import guestUserRoute from "./routes/guestUser/guestUserRoute.js"
 // Import the new router
=======
import organizationRoute from "./routes/organization/index.js"

>>>>>>> 1419129f34fbf700c6f9266c11bd92cd269c3280

dotenv.config();
const app = express();

cron.schedule('*/1 * * * *', async () => {
  try {
    await scrapeAndStoreETFData();
    console.log('ETF data scraped and saved successfully');
  } catch (error) {
    console.error('Error scraping ETF data:', error.message);
  }
});

connectDB();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/v1/api/user", userRoute);
app.use("/v1/api/admin", adminRoute);
app.use("/v1/api/organization", organizationRoute);
app.use("/v1/api/guestUser",guestUserRoute)
 // Use the new router

 
// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});



fetchNifty50Data();