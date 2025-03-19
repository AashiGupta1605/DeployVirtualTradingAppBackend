// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import cron from 'node-cron';
import { scrapeAndStoreETFData } from './scripts/scraper2.js';
import { fetchNifty50Data } from './scripts/scraper.js';
import { fetchNifty500Data } from './scripts/nifty500Scraper.js';
import userRoute from "./routes/user/index.js";
import adminRoute from "./routes/admin/adminRoute.js";
import organizationRoute from "./routes/organization/index.js";
import guestUserRoute from "./routes/guestUser/guestUserRoute.js";
import { errorHandler } from './middlewares/errorHandler.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use("/v1/api/user", userRoute);
app.use("/v1/api/admin", adminRoute);
app.use("/v1/api/organization", organizationRoute);
app.use("/v1/api/guestUser", guestUserRoute);
app.use(errorHandler);

// Health check
app.get('/health', (_, res) => res.status(200).json({ 
  status: 'OK', 
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

// Scraping functions
const scrapeWithRetry = async (scraperFn, name, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await scraperFn();
      return result ? { success: true, data: result } : { success: false, error: 'No data' };
    } catch (error) {
      if (i === maxRetries - 1) return { success: false, error: error.message };
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

const runAllScrapers = async () => {
  const scrapers = [
    { fn: scrapeAndStoreETFData, name: 'ETF' },
    { fn: fetchNifty50Data, name: 'Nifty 50' },
    { fn: fetchNifty500Data, name: 'Nifty 500' }
  ];

  const results = await Promise.allSettled(
    scrapers.map(scraper => scrapeWithRetry(scraper.fn, scraper.name))
  );

  return results.reduce((summary, result, index) => {
    const success = result.status === 'fulfilled' && result.value.success;
    summary[scrapers[index].name] = success ? 'success' : 'failed';
    return summary;
  }, {});
};

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    
    // Setup cron jobs
    cron.schedule('*/1 * * * *', runAllScrapers);
    cron.schedule('0 0 * * *', () => console.log('Daily cleanup job'));

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      runAllScrapers(); // Initial scraping
    });

    // Graceful shutdown
    const shutdown = async () => {
      server.close();
      await mongoose.connection.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Error handlers
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();

export default app;