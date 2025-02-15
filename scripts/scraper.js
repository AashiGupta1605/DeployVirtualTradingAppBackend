import fs from 'fs';
import axios from 'axios';
import NiftyData from '../models/NiftyData.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonFilePath = path.join(__dirname, 'nifty50data.json');

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

const saveDataToJson = (data) => {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ JSON file updated successfully.');
  } catch (err) {
    console.error('❌ Error writing to JSON file:', err);
  }
};

const saveNiftyDataToDB = async (formattedData) => {
  try {
    const result = await NiftyData.create(formattedData);
    console.log(`✅ ${result.stocks.length} records inserted into the database.`);
    return result.stocks[result.stocks.length - 1];
  } catch (err) {
    console.error('❌ Error saving data to DB:', err);
  }
};

const isDataDifferent = (oldStock, newStock) => {
  // Keys included in the comparison
  const keysToCheck = [
    'symbol', 'open', 'dayHigh', 'dayLow', 'lastPrice', 'previousClose', 
    'change', 'pChange', 'totalTradedVolume', 'totalTradedValue', 
    'lastUpdateTime', 'yearHigh', 'yearLow'
  ];

  // Keys explicitly NOT included in the comparison
  const excludedKeys = [
    'perChange365d', 'date365dAgo', 'date30dAgo', 'perChange30d', 'timestamp'
  ];

  let differences = {};

  keysToCheck.forEach((key) => {
    if (oldStock[key] !== newStock[key]) {
      differences[key] = { old: oldStock[key], new: newStock[key] };
    }
  });

  return Object.keys(differences).length > 0 ? differences : null;
};




export const fetchNifty50Data = async () => {
  try {
    const baseURL = "https://www.nseindia.com";
    const apiURL = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050";

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Referer': 'https://www.nseindia.com/market-data/live-equity-market',
      'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Cookie': '_ga=GA1.1.887963696.1737917672; bm_mi=017740FE718CD85EE9FE2B3A912B0E76~YAAQjc8uF4B4z6eUAQAA9JQAqRo0g+r5Evm8XL6QThm7/BDuyHrVx22l8iLaxSN4TQ2tfp5gPKrfm+T1iBRorLBatVJrEbDz42QIGdoXhKES4zSwt0c7CEcsLjEwpQQa/MFyzI9YuAab2CBGJb5GOo24QIeF6h+GRzOms6VjvMpH68YpFFoy09HNe5oPgJNc2m8FJrg7U1O9e/dOazaEjQJr9Ql51GJbizxBw4aSHKUnulbs65shSBlV4f96+bD0+Z7Ht70a12ZUpHWJ1eoPGcb7bBw+5rILAf4vjE0puBri/oQNULQR8V7Ptj1CnutBkfDOrYmAG95N46iXpR6Q8a4jTJ/bEKnvHbNOXMq8NDiY6Pq4HtZ+~1;',
    };

    const session = axios.create({ headers, withCredentials: true, timeout: 10000 });
    await session.get(baseURL);

    const response = await session.get(apiURL);
    if (response.status !== 200) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    // console.log("Fetched data:", response.data);


    const apiData = response.data;
    if (!apiData || !apiData.data || !Array.isArray(apiData.data)) {
      throw new Error('❌ Invalid response structure from NSE API');
    }

    const formattedData = {
      fetchTime: new Date(),
      stocks: apiData.data.map(item => ({
        symbol: item.symbol || 'N/A',
        open: item.open || 0,
        dayHigh: item.dayHigh || 0,
        dayLow: item.dayLow || 0,
        lastPrice: item.lastPrice || 0,
        previousClose: item.previousClose || 0,
        change: item.change || 0,
        pChange: item.pChange || 0,
        totalTradedVolume: item.totalTradedVolume || 0,
        totalTradedValue: item.totalTradedValue || 0,
        lastUpdateTime: item.lastUpdateTime || 'N/A',
        yearHigh: item.yearHigh || 0,
        yearLow: item.yearLow || 0,
        perChange365d: item.perChange365d === '-' ? null : parseFloat(item.perChange365d),
        date365dAgo: item.date365dAgo || 'N/A',
        date30dAgo: item.date30dAgo || 'N/A',
        perChange30d: item.perChange30d === '-' ? null : parseFloat(item.perChange30d),
        timestamp: new Date(),
      }))
    };

    const oldData = readDataFromJson();
    let changesDetected = false;
    
    if (!oldData || !oldData.stocks) {
      changesDetected = true;
    } else {
      formattedData.stocks.forEach(newStock => {
        const oldStock = oldData.stocks.find(stock => stock.symbol === newStock.symbol);
        const differences = oldStock ? isDataDifferent(oldStock, newStock) : null;
    
        if (differences) {
          changesDetected = true;
          console.log(`🔄 Changes detected for ${newStock.symbol}:`, differences);
        }
      });
    }
    

    if (changesDetected) {
      saveDataToJson(formattedData);
      await saveNiftyDataToDB(formattedData);
      console.log('✅ New data saved!');
    } else {
      console.log('No changes. Data remains the same.');
    }

    return formattedData;
  } catch (error) {
    console.error('Error');
  }
};

export const startAutoFetch = (interval) => { // 5 minutes = 300000 ms
  console.log(`Starting auto-fetch every ${interval / 1000 / 60} minutes...`);
  setInterval(() => {
    fetchNifty50Data().catch(err => console.error('❌ Error during auto-fetch:', err));
  }, interval);
};


startAutoFetch(60000);