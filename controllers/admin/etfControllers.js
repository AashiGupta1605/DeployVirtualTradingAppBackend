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

export const getETFHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const historicalData = await NiftyETFData.find()
      .sort({ fetchTime: -1 })
      .limit(30);

    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({ message: 'No historical data available' });
    }

    const symbolData = historicalData
      .map(record => {
        const stockData = record.stocks.find(stock => stock.symbol === symbol);
        if (stockData) {
          return {
            ...stockData.toObject(),
            fetchTime: record.fetchTime
          };
        }
        return null;
      })
      .filter(Boolean);

    if (symbolData.length === 0) {
      return res.status(404).json({ message: `No historical data found for symbol ${symbol}` });
    }

    res.status(200).json(symbolData);
  } catch (error) {
    console.error('Error fetching historical ETF data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};