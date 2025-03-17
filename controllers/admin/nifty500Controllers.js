import Nifty500Data from '../../models/Nifty500DataModal.js';

export const saveNifty500Data = async (formattedData) => {
  try {
    // Validate input
    if (!formattedData || !formattedData.stocks || formattedData.stocks.length === 0) {
      console.error('❌ Invalid data: No stocks to save');
      return null;
    }

    // Log detailed input data
    console.log('Saving Nifty 500 Data:', {
      fetchTime: formattedData.fetchTime,
      stockCount: formattedData.stocks.length,
      firstStock: formattedData.stocks[0]
    });

    // Create new document
    const newData = new Nifty500Data({
      fetchTime: formattedData.fetchTime || new Date(),
      stocks: formattedData.stocks
    });

    // Validate the document
    try {
      await newData.validate();
    } catch (validationError) {
      console.error('❌ Validation Error:', validationError.message);
      console.error('Validation Errors:', validationError.errors);
      return null;
    }

    // Save to database
    const savedData = await newData.save();
    
    console.log('✅ Data saved to database successfully', {
      savedStockCount: savedData.stocks.length,
      savedFetchTime: savedData.fetchTime
    });

    return savedData;
  } catch (error) {
    console.error('❌ Detailed Error saving to database:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      validationErrors: error.errors ? Object.keys(error.errors) : 'No validation errors'
    });
    
    // Additional error handling for specific MongoDB errors
    if (error.name === 'MongoServerError') {
      switch (error.code) {
        case 11000:
          console.error('Duplicate key error');
          break;
        case 18:
          console.error('Validation error');
          break;
        default:
          console.error('Unhandled MongoDB error');
      }
    }
    
    return null;
  }
};

export const getNifty500Data = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Nifty500Data.find()
        .sort({ fetchTime: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Nifty500Data.countDocuments()
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
    console.log('Fetching data for symbol:', symbol);

    // First, find the latest document
    const latestDocument = await Nifty500Data.findOne({}, {}, { sort: { 'fetchTime': -1 } });

    if (!latestDocument) {
      console.log('No documents found in the database');
      return res.status(404).json({
        message: "No data available"
      });
    }

    // Find the specific stock in the stocks array
    const stockData = latestDocument.stocks.find(stock => stock.symbol === symbol);

    if (!stockData) {
      console.log('Symbol not found in latest document');
      return res.status(404).json({
        message: `No data found for symbol ${symbol}`
      });
    }

    // Format the response
    const response = {
      fetchTime: latestDocument.fetchTime,
      ...stockData.toObject()
    };

    console.log('Sending response for symbol:', symbol);
    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChartDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeRange = '1D' } = req.query;
    
    console.log('Fetching chart data for:', { symbol, timeRange });

    const currentDate = new Date();
    let startDate = new Date(currentDate);

    // Calculate start date based on time range
    switch (timeRange) {
      case '1W':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(currentDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(currentDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default: // 1D
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Find all documents within the date range
    const documents = await Nifty500Data.find({
      fetchTime: {
        $gte: startDate,
        $lte: currentDate
      }
    }).sort({ fetchTime: 1 });

    console.log(`Found ${documents.length} documents in date range`);

    // Extract and format the data for the specific symbol
    const chartData = documents.map(doc => {
      const stockData = doc.stocks.find(stock => stock.symbol === symbol);
      if (!stockData) return null;

      return {
        date: doc.fetchTime.toISOString().split('T')[0],
        open: stockData.open,
        high: stockData.dayHigh,
        low: stockData.dayLow,
        close: stockData.lastPrice,
        volume: stockData.totalTradedVolume
      };
    }).filter(data => data !== null);

    if (chartData.length === 0) {
      console.log('No chart data found for symbol:', symbol);
      return res.status(404).json({
        message: `No chart data found for symbol ${symbol} in the specified time range`
      });
    }

    console.log(`Sending ${chartData.length} data points for symbol:`, symbol);
    res.status(200).json(chartData);

  } catch (error) {
    console.error('Error in getChartDataBySymbol:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update your routes file to use asyncHandler
export const getLatestBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await Nifty500Data.findLatestBySymbol(symbol);
    
    if (!data.length) {
      return res.status(404).json({ message: 'Symbol not found' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error fetching symbol data:', error);
    res.status(500).json({ message: 'Error fetching symbol data' });
  }
};

export const getHistoricalDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit) || 30;
    
    const data = await Nifty500Data.findHistoricalDataBySymbol(symbol, limit);
    
    if (!data.length) {
      return res.status(404).json({ message: 'Symbol not found' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ message: 'Error fetching historical data' });
  }
};