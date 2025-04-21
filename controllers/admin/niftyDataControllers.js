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
    
    // Adjust time range calculation
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
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case '3M':
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 3);
        break;
      default:
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
    }

    // Modified aggregation pipeline
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
          date: '$fetchTime',
          lastUpdateTime: '$stocks.lastUpdateTime',
          open: { $toDouble: '$stocks.open' },
          dayHigh: { $toDouble: '$stocks.dayHigh' },
          dayLow: { $toDouble: '$stocks.dayLow' },
          lastPrice: { $toDouble: '$stocks.lastPrice' },
          previousClose: { $toDouble: '$stocks.previousClose' },
          change: { $toDouble: '$stocks.change' },
          pChange: { $toDouble: '$stocks.pChange' },
          totalTradedVolume: { $toDouble: '$stocks.totalTradedVolume' },
          totalTradedValue: { $toDouble: '$stocks.totalTradedValue' }
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

export const getHistoricalDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    console.log(`Fetching all historical data for symbol: ${symbol}`);

    // Find all documents containing the specified symbol
    const documents = await NiftyData.aggregate([
      // Unwind the stocks array to work with individual stock entries
      { $unwind: '$stocks' },
      
      // Match documents with the specified symbol
      { $match: { 'stocks.symbol': symbol } },
      
      // Sort by fetchTime in ascending order
      { $sort: { fetchTime: 1 } },
      
      // Project only the needed fields
      {
        $project: {
          _id: 0,
          date: '$fetchTime',
          lastUpdateTime: '$stocks.lastUpdateTime',
          open: { $toDouble: '$stocks.open' },
          high: { $toDouble: '$stocks.dayHigh' },
          low: { $toDouble: '$stocks.dayLow' },
          close: { $toDouble: '$stocks.lastPrice' },
          volume: { $toDouble: '$stocks.totalTradedVolume' },
          value: { $toDouble: '$stocks.totalTradedValue' },
          pChange: { $toDouble: '$stocks.pChange' }
        }
      }
    ]);

    console.log(`Found ${documents.length} historical records for symbol: ${symbol}`);

    if (documents.length === 0) {
      console.log('No historical data found for symbol:', symbol);
      return res.status(404).json({
        message: `No historical data found for symbol ${symbol}`
      });
    }

    // Format the response data
    const formattedData = documents.map(doc => ({
      date: doc.date,
      lastUpdateTime: doc.lastUpdateTime,
      open: Number(doc.open).toFixed(2),
      high: Number(doc.high).toFixed(2),
      low: Number(doc.low).toFixed(2),
      close: Number(doc.close).toFixed(2),
      volume: Number(doc.volume),
      value: Number(doc.value),
      pChange: Number(doc.pChange).toFixed(2)
    }));

    console.log(`Successfully processed ${formattedData.length} data points for ${symbol}`);
    
    // Add metadata to the response
    const response = {
      symbol,
      totalRecords: formattedData.length,
      firstDate: formattedData[0]?.date,
      lastDate: formattedData[formattedData.length - 1]?.date,
      data: formattedData
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching historical data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};