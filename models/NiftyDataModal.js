// models/NiftyDataModal.js
import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    trim: true
    // Removed index: true to prevent duplicate indexing
  },
  open: {
    type: Number,
    required: true,
    min: 0
  },
  dayHigh: {
    type: Number,
    required: true,
    min: 0
  },
  dayLow: {
    type: Number,
    required: true,
    min: 0
  },
  lastPrice: {
    type: Number,
    required: true,
    min: 0
  },
  previousClose: {
    type: Number,
    required: true,
    min: 0
  },
  change: {
    type: Number,
    required: true
  },
  pChange: {
    type: Number,
    required: true
  },
  totalTradedVolume: {
    type: Number,
    required: true,
    min: 0
  },
  totalTradedValue: {
    type: Number,
    required: true,
    min: 0
  },
  lastUpdateTime: {
    type: String,
    required: true
  },
  yearHigh: {
    type: Number,
    required: true,
    min: 0
  },
  yearLow: {
    type: Number,
    required: true,
    min: 0
  },
  perChange365d: {
    type: Number,
    default: null
  },
  date365dAgo: {
    type: String,
    default: null
  },
  date30dAgo: {
    type: String,
    default: null
  },
  perChange30d: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
    // Removed index: true as it's covered by compound index
  }
}, {
  _id: false, // Prevent MongoDB from creating _id for each stock
  timestamps: false // Remove timestamps from subdocuments
});

const niftyDataSchema = new mongoose.Schema({
  fetchTime: {
    type: Date,
    required: true,
    default: Date.now
    // Removed index: true as it's covered by compound index
  },
  stocks: [stockSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Single compound index that covers most query patterns
niftyDataSchema.index(
  { 
    fetchTime: -1, 
    'stocks.symbol': 1 
  },
  { 
    background: true,
    name: 'fetch_symbol_compound_idx'
  }
);

// Static methods with error handling
niftyDataSchema.statics = {
  async findLatestBySymbol(symbol) {
    try {
      return await this.aggregate([
        { $sort: { fetchTime: -1 } },
        { $limit: 1 },
        { $unwind: '$stocks' },
        { $match: { 'stocks.symbol': symbol } },
        {
          $project: {
            _id: 0,
            fetchTime: 1,
            stock: '$stocks'
          }
        }
      ]);
    } catch (error) {
      console.error('Error in findLatestBySymbol:', error);
      throw error;
    }
  },

  async findHistoricalDataBySymbol(symbol, limit = 30) {
    try {
      return await this.aggregate([
        { $sort: { fetchTime: -1 } },
        { $limit: limit },
        { $unwind: '$stocks' },
        { $match: { 'stocks.symbol': symbol } },
        {
          $project: {
            _id: 0,
            fetchTime: 1,
            stock: '$stocks'
          }
        },
        { $sort: { fetchTime: -1 } }
      ]);
    } catch (error) {
      console.error('Error in findHistoricalDataBySymbol:', error);
      throw error;
    }
  }
};

// Validation middleware
niftyDataSchema.pre('save', async function(next) {
  try {
    if (!this.stocks?.length) {
      throw new Error('Stocks array cannot be empty');
    }

    const symbols = new Set();
    const duplicates = [];
    
    this.stocks.forEach(stock => {
      if (symbols.has(stock.symbol)) {
        duplicates.push(stock.symbol);
      }
      symbols.add(stock.symbol);
    });

    if (duplicates.length) {
      throw new Error(`Duplicate symbols found: ${duplicates.join(', ')}`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
niftyDataSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicate key error'));
  } else {
    next(error);
  }
});

const NiftyData = mongoose.model('NiftyData', niftyDataSchema);

// Initialize indexes without automatic creation
const initializeIndexes = async () => {
  try {
    // Check if indexes exist before creating
    const existingIndexes = await NiftyData.collection.getIndexes();
    if (!existingIndexes.fetch_symbol_compound_idx) {
      await NiftyData.collection.createIndex(
        { fetchTime: -1, 'stocks.symbol': 1 },
        { 
          background: true,
          name: 'fetch_symbol_compound_idx'
        }
      );
      console.log('NiftyData indexes created successfully');
    }
  } catch (error) {
    console.error('Error initializing indexes:', error);
  }
};

// Initialize indexes when the model is first loaded
initializeIndexes();

export default NiftyData;