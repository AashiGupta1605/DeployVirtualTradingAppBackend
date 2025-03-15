// scripts/nifty500Scraper.js

import { saveNifty500Data } from '../controllers/admin/nifty500Controllers.js';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import Nifty500Data from '../models/Nifty500DataModal.js';

const jsonFilePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'nifty500data.json');

const readDataFromJson = () => {
  try {
    return fs.existsSync(jsonFilePath) ? JSON.parse(fs.readFileSync(jsonFilePath, 'utf8')) : null;
  } catch (err) {
    console.error('❌ Error reading JSON:', err);
    return null;
  }
};

const saveDataToJson = data => {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
    console.log('✅ JSON updated successfully');
  } catch (err) {
    console.error('❌ Error writing JSON:', err);
  }
};

const saveNifty500DataToDB = async data => {
  try {
    const result = await Nifty500Data.create(data);
    console.log(`✅ ${result.stocks.length} records saved to database`);
    return result;
  } catch (err) {
    console.error('❌ Database save error:', err);
  }
};

const isDataDifferent = (oldStock, newStock) => {
  const keysToCheck = ['symbol', 'open', 'dayHigh', 'dayLow', 'lastPrice', 'previousClose', 
    'change', 'pChange', 'totalTradedVolume', 'totalTradedValue', 'lastUpdateTime', 'yearHigh', 'yearLow'];

  return keysToCheck.reduce((diff, key) => {
    if (oldStock[key] !== newStock[key]) {
      diff[key] = {
        old: oldStock[key],
        new: newStock[key],
        difference: key.includes('Price') || key.includes('High') || key.includes('Low') || 
                   key.includes('change') || key.includes('Change') ? 
                   (newStock[key] - oldStock[key]).toFixed(2) : (newStock[key] - oldStock[key])
      };
    }
    return diff;
  }, {});
};

const logChanges = (symbol, differences) => {
  if (Object.keys(differences).length === 0) return;
  
  console.log(`\n🔄 Changes detected for ${symbol}:`);
  Object.entries(differences).forEach(([key, { old, new: newVal, difference }]) => {
    const changeColor = newVal > old ? '\x1b[32m' : '\x1b[31m';
    console.log(`${key}: ${old} → ${changeColor}${newVal}\x1b[0m (${difference})`);
  });
};

export const fetchNifty500Data = async () => {
  try {
    console.log('\n🔄 Starting Nifty 500 data fetch...');

    const session = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.nseindia.com/market-data/live-equity-market'
      },
      withCredentials: true,
      timeout: 30000
    });
    const baseURL = "https://www.nseindia.com";
    const cookies = (await session.get(baseURL)).headers['set-cookie'];
    if (!cookies) throw new Error('No cookies received');
    session.defaults.headers.Cookie = cookies.map(c => c.split(';')[0]).join('; ');

    console.log('📍 Fetching Nifty 500 data from NSE...');
    const response = await session.get(`${baseURL}/api/equity-stockIndices?index=NIFTY%20500`);
    if (!response.data?.data) throw new Error('Invalid API response');

    const formattedData = {
      fetchTime: new Date(),
      stocks: response.data.data.map(item => ({
        symbol: item.symbol || 'N/A',
        open: parseFloat(item.open) || 0,
        dayHigh: parseFloat(item.dayHigh) || 0,
        dayLow: parseFloat(item.dayLow) || 0,
        lastPrice: parseFloat(item.lastPrice) || 0,
        previousClose: parseFloat(item.previousClose) || 0,
        change: parseFloat(item.change) || 0,
        pChange: parseFloat(item.pChange) || 0,
        totalTradedVolume: parseInt(item.totalTradedVolume) || 0,
        totalTradedValue: parseFloat(item.totalTradedValue) || 0,
        lastUpdateTime: item.lastUpdateTime || 'N/A',
        yearHigh: parseFloat(item.yearHigh) || 0,
        yearLow: parseFloat(item.yearLow) || 0,
        perChange365d: item.perChange365d === '-' ? null : parseFloat(item.perChange365d),
        date365dAgo: item.date365dAgo || 'N/A',
        date30dAgo: item.date30dAgo || 'N/A',
        perChange30d: item.perChange30d === '-' ? null : parseFloat(item.perChange30d),
        timestamp: new Date()
      }))
    };

    console.log(`✅ Successfully processed ${formattedData.stocks.length} stocks`);

    // Always save data, regardless of changes
    console.log('💾 Saving data to JSON and Database...');
    saveDataToJson(formattedData);
    
    // Attempt to save to database
    const savedResult = await saveNifty500Data(formattedData);
    
    if (!savedResult) {
      console.error('❌ Failed to save data to database');
      return null;
    }

    console.log('✅ Data saved successfully');
    return formattedData;
  } catch (error) {
    console.error('\n❌ Error in Nifty 500 data fetch:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    
    throw error;
  }
};

export const testDatabaseConnection = async () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};