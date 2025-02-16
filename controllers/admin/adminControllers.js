import NiftyData from '../../models/NiftyDataModal.js';

export const saveNiftyData = async (req, res) => {
  try {
    const { name, value } = req.body;
    await new NiftyData({ name, value }).save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data to the database.' });
  }
};

export const getNiftyData = async (req, res) => {
  try {
    res.status(200).json(await NiftyData.find());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
};

export const getCompanyBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const latestData = await NiftyData.findOne().sort({ fetchTime: -1 });
    if (!latestData?.stocks) return res.status(404).json({ message: 'No stock data available' });
    const company = latestData.stocks.find(stock => stock.symbol === symbol);
    if (!company) return res.status(404).json({ message: `Company with symbol ${symbol} not found` });
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllCompanyDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const allBatches = await NiftyData.find();
    if (!allBatches.length) return res.status(404).json({ message: 'No stock data available' });
    const companyData = allBatches.flatMap(batch => batch.stocks.filter(stock => stock.symbol === symbol));
    if (!companyData.length) return res.status(404).json({ message: `Company with symbol ${symbol} not found` });
    res.status(200).json(companyData);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};