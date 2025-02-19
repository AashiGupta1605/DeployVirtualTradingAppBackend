import NiftyData from '../../models/NiftyDataModal.js';
import { saveNiftyDataValidation, getCompanyBySymbolValidation,} from '../../helpers/joiValidation.js';
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
    res.status(200).json(await NiftyData.find());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
};

// Get latest company data by symbol
export const getCompanyBySymbol = async (req, res) => {
  try {
    // Validate request params
    const { error } = getCompanyBySymbolValidation.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { symbol } = req.params;
    const latestData = await NiftyData.findOne().sort({ fetchTime: -1 });

    if (!latestData?.stocks) {
      return res.status(404).json({ message: 'No stock data available' });
    }

    const company = latestData.stocks.find(stock => stock.symbol === symbol);
    if (!company) {
      return res.status(404).json({ message: `Company with symbol ${symbol} not found` });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all historical data of a company by symbol
export const getAllCompanyDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const allBatches = await NiftyData.find();

    if (!allBatches.length) {
      return res.status(404).json({ message: 'No stock data available' });
    }

    const companyData = allBatches.flatMap(batch => batch.stocks.filter(stock => stock.symbol === symbol));
    if (!companyData.length) {
      return res.status(404).json(`{ message: Company with symbol ${symbol} not found }`);
    }

    res.status(200).json(companyData);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

