
import axios from 'axios';
import NiftyETFData from '../models/Stock.js';
import dotenv from 'dotenv';
dotenv.config();

export const scrapeAndStoreETFData = async () => {
  try {
    let initialResponse = await axios.get(process.env.ETF_HOME_PAGE, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
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

    const stocks = etfData.map((data) => ({
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
    }));

    const today = new Date().toISOString().split('T')[0];
    await NiftyETFData.findOneAndUpdate(
      {
        fetchTime: {
          $gte: new Date(today + 'T00:00:00.000Z'),
          $lt: new Date(today + 'T23:59:59.999Z'),
        },
      },
      { fetchTime: new Date(), stocks },
      { upsert: true }
    );

    console.log('ETF data saved successfully');
  } catch (error) {
    console.error('Error scraping ETF data:', error.message);
  }
};

// Get latest stock data
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

