// controllers/etfController.js
import NiftyETFData  from '../../models/StockModal.js';


export const getETFBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const latestData = await NiftyETFData.findOne()
      .sort({ fetchTime: -1 });

    if (!latestData || !latestData.stocks) {
      return res.status(404).json({ message: 'No ETF data available' });
    }

    const etf = latestData.stocks.find(stock => stock.symbol === symbol);
    
    if (!etf) {
      return res.status(404).json({ message: `ETF with symbol ${symbol} not found` });
    }

    res.status(200).json(etf);
  } catch (error) {
    console.error('Error fetching ETF data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/etfController.js

export const getETFHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeRange } = req.query;
    
    const historicalData = await NiftyETFData.find({ 'stocks.symbol': symbol })
      .sort({ fetchTime: -1 })
      .limit(30);

    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({ message: 'No historical data available' });
    }

    // Format the data to match what the frontend expects
    const formattedData = historicalData.map(doc => {
      const stockData = doc.stocks.find(stock => stock.symbol === symbol);
      return {
        fetchTime: doc.fetchTime,
        open: stockData.open,
        dayHigh: stockData.dayHigh,
        dayLow: stockData.dayLow,
        lastPrice: stockData.lastPrice,
        totalTradedVolume: stockData.totalTradedVolume,
        totalTradedValue: stockData.totalTradedValue,
        pChange: stockData.pChange || 0
      };
    });

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching historical ETF data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};