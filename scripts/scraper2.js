
// new etf working code first store in json then store in db

import axios from 'axios';
import NiftyETFData from '../models/StockModal.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonFilePath = path.join(__dirname, 'etfData.json');

// Helper function to read data from JSON file
const readDataFromJson = () => {
  try {
    if (fs.existsSync(jsonFilePath)) {
      const data = fs.readFileSync(jsonFilePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    console.error('❌ Error reading JSON file:', err);
    return null;
  }
};

// Helper function to save data to JSON file
const saveDataToJson = (data) => {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ JSON file updated successfully.');
  } catch (err) {
    console.error('❌ Error writing to JSON file:', err);
  }
};

// Helper function to compare old and new data
const isDataDifferent = (oldData, newData) => {
  if (!oldData || !oldData.stocks || !newData || !newData.stocks) return true;

  const keysToCheck = [
    'symbol', 'open', 'dayHigh', 'dayLow', 'lastPrice', 'previousClose', 
    'change', 'pChange', 'totalTradedVolume', 'totalTradedValue', 
    'lastUpdateTime', 'yearHigh', 'yearLow', 'perChange365d', 'perChange30d'
  ];

  let changesDetected = false;

  newData.stocks.forEach((newStock, index) => {
    const oldStock = oldData.stocks[index];
    if (!oldStock) {
      changesDetected = true;
      return;
    }

    keysToCheck.forEach((key) => {
      if (newStock[key] !== oldStock[key]) {
        changesDetected = true;
      }
    });
  });

  return changesDetected;
};

// Function to save ETF data to the database
const saveETFDataToDB = async (formattedData) => {
  try {
    const result = await NiftyETFData.create(formattedData);
    console.log(`✅ ${result.stocks.length} records inserted into the database.`);
    return result.stocks[result.stocks.length - 1]; // Return the latest record
  } catch (err) {
    console.error('❌ Error saving data to DB:', err);
  }
};

// Main function to scrape and store ETF data
export const scrapeAndStoreETFData = async () => {
  try {
    let initialResponse = await axios.get(process.env.ETF_HOME_PAGE, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    let cookies = initialResponse.headers['set-cookie'];

    const response = await axios.get(process.env.ETF_STOCK_DETAIL_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com/market-data/exchange-traded-funds-etf',
        'Cookie': cookies ? cookies.join('; ') : '',
      },
    });

    const etfData = response.data.data;

    const safeParseFloat = (value, defaultValue = 0) =>
      value === '-' || value === '' || value === undefined ? defaultValue : parseFloat(value);

    const safeParseInt = (value, defaultValue = 0) =>
      value === '-' || value === '' || value === undefined ? defaultValue : parseInt(value);

    const formattedData = {
      fetchTime: new Date(),
      stocks: etfData.map((data) => ({
        symbol: data?.symbol || 'N/A',
        open: safeParseFloat(data?.open),
        dayHigh: safeParseFloat(data?.high),
        dayLow: safeParseFloat(data?.low),
        lastPrice: safeParseFloat(data?.ltP),
        previousClose: safeParseFloat(data?.prevClose),
        change: safeParseFloat(data?.chn),
        pChange: safeParseFloat(data?.per),
        totalTradedVolume: safeParseInt(data?.qty),
        totalTradedValue: safeParseInt(data?.trdVal),
        lastUpdateTime: data?.meta?.quotepreopenstatus?.equityTime || '',
        yearHigh: safeParseFloat(data?.wkhi),
        yearLow: safeParseFloat(data?.wklo),
        perChange365d: safeParseFloat(data?.yPC, null),
        date365dAgo: data?.date365dAgo || '',
        date30dAgo: data?.date30dAgo || '',
        perChange30d: safeParseFloat(data?.perChange30d, null),
        timestamp: new Date().toISOString(),
      })),
    };

    const oldData = readDataFromJson();
    const changesDetected = isDataDifferent(oldData, formattedData);

    if (changesDetected) {
      saveDataToJson(formattedData);
      await saveETFDataToDB(formattedData); // Use create to preserve historical data
      console.log('✅ New data saved to JSON and database!');
    } else {
      console.log('No changes. Data remains the same.');
    }

    return formattedData;
  } catch (error) {
    console.error('Error scraping ETF data:', error.message);
  }
};

// Function to get the latest ETF data
export const getETFData = async (req, res) => {
  try {
    const latestData = await NiftyETFData.findOne().sort({ fetchTime: -1 });

    if (!latestData) {
      return res.status(404).json({ message: "No stock data found" });
    }

    res.status(200).json(latestData.stocks);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const startAutoFetch = (interval) => { // 5 minutes = 300000 ms
  console.log(`Starting auto-fetch every ${interval / 1000 / 60} minutes...`);
  setInterval(() => {
    scrapeAndStoreETFData().catch(err => console.error('❌ Error during auto-fetch:', err));
  }, interval);
};


// startAutoFetch(60000);








