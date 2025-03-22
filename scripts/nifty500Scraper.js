import { saveNifty500Data } from '../controllers/admin/nifty500Controllers.js';
import fs from 'fs';
import axios from 'axios';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import Nifty500Data from '../models/Nifty500DataModal.js';

class Nifty500Scraper {
  constructor() {
    this.__dirname = path.dirname(fileURLToPath(import.meta.url));
    this.jsonFilePath = path.join(this.__dirname, 'nifty500data.json');
    this.baseURL = 'https://www.nseindia.com';
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.session = null;
  }

  // Utility Methods
  _safeParseFloat(value, defaultValue = 0) {
    return value === '-' || value === '' || value === undefined 
      ? defaultValue 
      : parseFloat(value);
  }

  _safeParseInt(value, defaultValue = 0) {
    return value === '-' || value === '' || value === undefined 
      ? defaultValue 
      : parseInt(value);
  }

  // File Operations
  _readDataFromJson() {
    try {
      return fs.existsSync(this.jsonFilePath) 
        ? JSON.parse(fs.readFileSync(this.jsonFilePath, 'utf8')) 
        : null;
    } catch (err) {
      console.error('❌ Error reading JSON:', err);
      return null;
    }
  }

  _saveDataToJson(data) {
    try {
      fs.writeFileSync(this.jsonFilePath, JSON.stringify(data, null, 2));
      console.log('✅ JSON updated successfully');
    } catch (err) {
      console.error('❌ Error writing JSON:', err);
    }
  }

  // Data Comparison
  _compareStockData(oldStocks, newStocks) {
    const changes = [];

    newStocks.forEach(newStock => {
      const oldStock = oldStocks.find(os => os.symbol === newStock.symbol);
      
      if (!oldStock) {
        // New stock added
        changes.push({
          symbol: newStock.symbol,
          type: 'NEW_STOCK',
          details: newStock
        });
        return;
      }

      // Compare key metrics
      const comparisonKeys = [
        'open', 'dayHigh', 'dayLow', 'lastPrice', 'previousClose', 
        'change', 'pChange', 'totalTradedVolume', 'totalTradedValue'
      ];

      const stockChanges = comparisonKeys.reduce((acc, key) => {
        // Use a small threshold to account for floating-point imprecision
        if (Math.abs(newStock[key] - oldStock[key]) > 0.001) {
          acc.push({
            key,
            oldValue: oldStock[key],
            newValue: newStock[key],
            percentChange: ((newStock[key] - oldStock[key]) / oldStock[key] * 100).toFixed(2)
          });
        }
        return acc;
      }, []);

      if (stockChanges.length > 0) {
        changes.push({
          symbol: newStock.symbol,
          type: 'STOCK_UPDATED',
          changes: stockChanges
        });
      }
    });

    return changes;
  }

  // Logging Changes
  _logChanges(changes) {
    console.log('\n🔍 Changes Detected:');
    changes.forEach(change => {
      if (change.type === 'NEW_STOCK') {
        console.log(`🆕 New Stock Added: ${change.symbol}`);
      } else if (change.type === 'STOCK_UPDATED') {
        console.log(`🔄 Stock Updated: ${change.symbol}`);
        change.changes.forEach(detail => {
          console.log(`   ${detail.key}: 
             Old: ${detail.oldValue} 
             New: ${detail.newValue} 
             Change: ${detail.percentChange}%`);
        });
      }
    });
  }

  // Create Axios Instance with Advanced Configuration
  _createAxiosInstance() {
    const httpsAgent = new https.Agent({  
      rejectUnauthorized: false,
      keepAlive: true
    });

    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.nseindia.com/market-data/live-equity-market',
        'Origin': this.baseURL,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      withCredentials: true
    });
  }

  // Establish Session
  async _establishSession() {
    try {
      console.log('🔐 Establishing NSE Session...');
      
      // Create a new axios instance for session
      const sessionInstance = this._createAxiosInstance();

      // Step 1: Initial home page request to get initial cookies
      const homeResponse = await sessionInstance.get('/', {
        validateStatus: () => true
      });

      // Step 2: Get market data page to simulate browser behavior
      const marketDataResponse = await sessionInstance.get('/market-data/live-equity-market', {
        validateStatus: () => true,
        headers: {
          'Referer': this.baseURL
        }
      });

      // Collect and prepare cookies
      const cookies = [
        ...(homeResponse.headers['set-cookie'] || []),
        ...(marketDataResponse.headers['set-cookie'] || [])
      ];

      // Create final session instance with collected cookies
      this.session = this._createAxiosInstance();
      this.session.defaults.headers['Cookie'] = cookies
        .map(cookie => cookie.split(';')[0])
        .join('; ');

      console.log('✅ NSE Session Established Successfully');
      return this.session;
    } catch (error) {
      console.error('❌ Session Establishment Failed:', error.message);
      throw error;
    }
  }

  // Data Processing
  _processStockData(item) {
    return {
      symbol: item.symbol || 'N/A',
      open: this._safeParseFloat(item.open),
      dayHigh: this._safeParseFloat(item.dayHigh),
      dayLow: this._safeParseFloat(item.dayLow),
      lastPrice: this._safeParseFloat(item.lastPrice),
      previousClose: this._safeParseFloat(item.previousClose),
      change: this._safeParseFloat(item.change),
      pChange: this._safeParseFloat(item.pChange),
      totalTradedVolume: this._safeParseInt(item.totalTradedVolume),
      totalTradedValue: this._safeParseFloat(item.totalTradedValue),
      lastUpdateTime: item.lastUpdateTime || 'N/A',
      yearHigh: this._safeParseFloat(item.yearHigh),
      yearLow: this._safeParseFloat(item.yearLow),
      perChange365d: item.perChange365d === '-' ? null : this._safeParseFloat(item.perChange365d),
      date365dAgo: item.date365dAgo || 'N/A',
      date30dAgo: item.date30dAgo || 'N/A',
      perChange30d: item.perChange30d === '-' ? null : this._safeParseFloat(item.perChange30d),
      timestamp: new Date()
    };
  }

  // Main Fetch Method with Advanced Error Handling
  async fetchNifty500Data() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`\n🔄 Starting Nifty 500 data fetch (Attempt ${attempt})...`);

        // Establish or refresh session
        if (!this.session) {
          await this._establishSession();
        }

        // Fetch Data
        console.log('📍 Fetching Nifty 500 data from NSE...');
        const response = await this.session.get('/api/equity-stockIndices', {
          params: { index: 'NIFTY 500' },
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });

        // Check for successful response
        if (response.status !== 200) {
          console.error(`❌ Unexpected response status: ${response.status}`);
          console.error('Response data:', response.data);
          
          // Reset session to force re-establishment
          this.session = null;
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
          continue;
        }

        // Validate Response
        if (!response.data?.data || !Array.isArray(response.data.data)) {
          throw new Error('Invalid API response structure');
        }

        // Process Data
        const formattedData = {
          fetchTime: new Date(),
          stocks: response.data.data.map(item => this._processStockData(item))
        };

        console.log(`✅ Successfully processed ${formattedData.stocks.length} stocks`);

        // Read existing JSON data
        const existingData = this._readDataFromJson();

        // Compare data
        let changes = [];
        let shouldUpdate = false;

        if (!existingData || !existingData.stocks) {
          // First fetch or no existing data
          shouldUpdate = true;
        } else {
          // Compare new data with existing data
          changes = this._compareStockData(existingData.stocks, formattedData.stocks);
          shouldUpdate = changes.length > 0;
        }

        // Update if changes detected
        if (shouldUpdate) {
          // Log changes if any
          if (changes.length > 0) {
            this._logChanges(changes);
          }

          // Save to JSON
          this._saveDataToJson(formattedData);

          // Save to Database
          console.log('💾 Saving data to Database...');
          const savedResult = await saveNifty500Data(formattedData);

          if (!savedResult) {
            console.error('❌ Failed to save data to database');
            return null;
          }

          console.log('✅ Data updated and saved successfully');
          return formattedData;
        } else {
          console.log('ℹ️ No changes detected. Data remains the same.');
          return null;
        }

      } catch (error) {
        console.error(`\n❌ Fetch attempt ${attempt} failed:`, error.message);
        
        // Reset session
        this.session = null;

        // Last attempt
        if (attempt === this.maxRetries) {
          console.error(`Failed to fetch Nifty 500 data after ${this.maxRetries} attempts`);
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }
}

// Create an instance of the scraper
const nifty500Scraper = new Nifty500Scraper();

// Export the fetch method
export const fetchNifty500Data = async () => {
  try {
    return await nifty500Scraper.fetchNifty500Data();
  } catch (error) {
    console.error('Nifty 500 Data Fetch Failed', error);
    throw error;
  }
};