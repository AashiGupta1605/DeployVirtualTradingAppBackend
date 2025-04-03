import express from 'express';
import cors from 'cors';
import path from "path";
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

// Get the absolute path of the current directory
const __dirname = path.resolve(); // Ensure correct path handling
app.use("/img", express.static(path.join(__dirname, "utils/img")));

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
      console.error(`Error in ${name} scraper (Attempt ${i + 1}):`, error.message);
      
      if (i === maxRetries - 1) {
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

const runAllScrapers = async () => {
  const scrapers = [
    { 
      fn: scrapeAndStoreETFData, 
      name: 'ETF',
      enabled: false // You can conditionally enable/disable scrapers
    },
    { 
      fn: fetchNifty50Data, 
      name: 'Nifty 50',
      enabled: true 
    },
    { 
      fn: fetchNifty500Data, 
      name: 'Nifty 500',
      enabled: false 
    }
  ];

  // Filter only enabled scrapers
  const enabledScrapers = scrapers.filter(scraper => scraper.enabled);

  const results = await Promise.allSettled(
    enabledScrapers.map(scraper => scrapeWithRetry(scraper.fn, scraper.name))
  );

  const summary = results.reduce((acc, result, index) => {
    const scraper = enabledScrapers[index];
    
    if (result.status === 'fulfilled') {
      acc[scraper.name] = result.value.success ? 'success' : 'failed';
      
      // Log detailed error if scraper failed
      if (!result.value.success) {
        console.error(`${scraper.name} Scraper Failed:`, result.value.error);
      }
    } else {
      acc[scraper.name] = 'failed';
      console.error(`${scraper.name} Scraper Threw an Unhandled Error:`, result.reason);
    }
    
    return acc;
  }, {});

  // Log overall scraping summary
  console.log('Scraping Summary:', summary);

  return summary;
};

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    
    // Setup cron jobs
    cron.schedule('*/1 * * * *', () => {
      runAllScrapers().catch(error => {
        console.error('Error in scheduled scraping:', error);
      });
    });

    // Daily cleanup job (example)
    cron.schedule('0 0 * * *', () => {
      console.log('Daily cleanup job');
      // Add any daily maintenance tasks
    });

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      
      // Initial scraping with error handling
      try {
        await runAllScrapers();
      } catch (scrapingError) {
        console.error('Initial scraping failed:', scrapingError);
      }
    });

    // Graceful shutdown
    const shutdown = async () => {
      try {
        server.close();
        await mongoose.connection.close();
        console.log('Server and database connection closed');
      } catch (error) {
        console.error('Error during shutdown:', error);
      } finally {
        process.exit(0);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Global error handlers
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  // Optionally send error to monitoring service
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Optionally send error to monitoring service
  // You might want to log the full promise for debugging
  console.error('Unhandled Promise:', promise);
});

startServer();

export default app;