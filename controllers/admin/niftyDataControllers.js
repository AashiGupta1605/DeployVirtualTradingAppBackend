// controllers/admin/niftyDataControllers.js
import NiftyData from '../../models/NiftyDataModal.js';
import { saveNiftyDataValidation, getCompanyBySymbolValidation } from '../../helpers/joiValidation.js';

// Save Nifty data
export const saveNiftyData = async (req, res) => {
  try {
    // Validate request body
    const { error } = saveNiftyDataValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, value } = req.body;
    await new NiftyData({ name, value }).save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data to the database.' });
  }
};

// Get all Nifty data
export const getNiftyData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      NiftyData.find()
        .sort({ fetchTime: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      NiftyData.countDocuments()
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

export const getCompanyBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;

    const latestData = await NiftyData.aggregate([
      // Get the latest document first
      { $sort: { fetchTime: -1 } },
      { $limit: 1 },
      // Unwind the stocks array
      { $unwind: '$stocks' },
      // Match the specific symbol
      { $match: { 'stocks.symbol': symbol } },
      // Project only needed fields
      {
        $project: {
          _id: 0,
          fetchTime: 1,
          symbol: '$stocks.symbol',
          open: '$stocks.open',
          dayHigh: '$stocks.dayHigh',
          dayLow: '$stocks.dayLow',
          lastPrice: '$stocks.lastPrice',
          previousClose: '$stocks.previousClose',
          change: '$stocks.change',
          pChange: '$stocks.pChange',
          totalTradedVolume: '$stocks.totalTradedVolume',
          totalTradedValue: '$stocks.totalTradedValue',
          lastUpdateTime: '$stocks.lastUpdateTime',
          yearHigh: '$stocks.yearHigh',
          yearLow: '$stocks.yearLow',
          perChange365d: '$stocks.perChange365d',
          perChange30d: '$stocks.perChange30d'
        }
      }
    ]).exec();

    if (!latestData.length) {
      return res.status(404).json({
        message: `No data found for symbol ${symbol}`
      });
    }

    res.status(200).json(latestData[0]);

  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getChartDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeRange } = req.query;
    
    const currentDate = new Date();
    let startDate;
    let numberOfRecords;
    
    switch (timeRange) {
      case '1D':
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        numberOfRecords = 1;
        break;
      case '1W':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        numberOfRecords = 7;
        break;
      case '1M':
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
        numberOfRecords = 30;
        break;
      case '3M':
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 3);
        numberOfRecords = 90;
        break;
      default:
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        numberOfRecords = 1;
    }

    // Aggregation pipeline for daily OHLC data
    const aggregationPipeline = [
      {
        $match: {
          fetchTime: {
            $gte: startDate,
            $lte: currentDate
          }
        }
      },
      { $unwind: '$stocks' },
      { $match: { 'stocks.symbol': symbol } },
      {
        $group: {
          _id: {
            date: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$fetchTime",
                timezone: "Asia/Kolkata"
              } 
            }
          },
          open: { $first: '$stocks.open' },
          high: { $first: '$stocks.dayHigh' },
          low: { $first: '$stocks.dayLow' },
          close: { $first: '$stocks.lastPrice' }
        }
      },
      { $sort: { '_id.date': -1 } }, // Sort by date descending
      { $limit: numberOfRecords }, // Limit to required number of records
      { $sort: { '_id.date': 1 } }, // Sort back to ascending for chart display
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          open: 1,
          high: 1,
          low: 1,
          close: 1
        }
      }
    ];

    const chartData = await NiftyData.aggregate(aggregationPipeline).exec();

    if (!chartData.length) {
      return res.status(404).json({
        message: `No chart data found for symbol ${symbol} in the specified time range`
      });
    }

    console.log(`Returning ${chartData.length} records for chart data`);
    res.status(200).json(chartData);

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// For Table Data - All records with full details
export const getHistoricalDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeRange } = req.query;
    
    const currentDate = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1D':
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '1W':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '1M':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case '3M':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 90);
        break;
      default:
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
    }

    // Aggregation pipeline for full historical data
    const aggregationPipeline = [
      {
        $match: {
          fetchTime: {
            $gte: startDate,
            $lte: currentDate
          }
        }
      },
      { $unwind: '$stocks' },
      { $match: { 'stocks.symbol': symbol } },
      { $sort: { fetchTime: -1 } },
      {
        $project: {
          _id: 0,
          lastUpdateTime: '$stocks.lastUpdateTime',
          open: '$stocks.open',
          dayHigh: '$stocks.dayHigh',
          dayLow: '$stocks.dayLow',
          lastPrice: '$stocks.lastPrice',
          previousClose: '$stocks.previousClose',
          change: '$stocks.change',
          pChange: '$stocks.pChange',
          totalTradedVolume: '$stocks.totalTradedVolume',
          totalTradedValue: '$stocks.totalTradedValue'
        }
      }
    ];

    const historicalData = await NiftyData.aggregate(aggregationPipeline).exec();

    if (!historicalData.length) {
      return res.status(404).json({
        message: `No historical data found for symbol ${symbol} in the specified time range`
      });
    }

    res.status(200).json(historicalData);

  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};