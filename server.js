// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cron from 'node-cron';
import { scrapeAndStoreETFData } from './scripts/scraper2.js';
import { fetchNifty50Data } from './scripts/scraper.js';
import contactRoute from "./routes/user/contactRoutes.js";
import userRoute from "./routes/user/userRoutes.js";
import adminRoute from "./routes/admin/adminRoute.js";
import orgRoute from "./routes/organization/organizationRoute.js"
 // Import the new router

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

app.use(cors());
app.use(express.json());

app.use("/api/contact", contactRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/org", orgRoute);
 // Use the new router



// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});



fetchNifty50Data();