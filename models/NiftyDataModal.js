// models/NiftyDataModal.js
import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    trim: true,
    index: true
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
    default: Date.now,
    index: true // Add index for timestamp
  }
}, {
  timestamps: true,
  _id: false // Prevent MongoDB from creating _id for each stock
});

const niftyDataSchema = new mongoose.Schema({
  fetchTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  stocks: [stockSchema]
}, {
  timestamps: true,
  // Add options for better performance
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Remove duplicate indexes and optimize them
niftyDataSchema.index({ fetchTime: -1 }, { background: true });
niftyDataSchema.index({ 'stocks.symbol': 1 }, { background: true });
niftyDataSchema.index(
  { fetchTime: -1, 'stocks.symbol': 1 },
  { 
    background: true,
    name: 'fetch_symbol_compound_idx' // Named index for better monitoring
  }
);

// Optimize static methods for common queries
niftyDataSchema.statics = {
  async findLatestBySymbol(symbol) {
    return this.aggregate([
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
    ]).exec();
  },

  async findHistoricalDataBySymbol(symbol, limit = 30) {
    return this.aggregate([
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
    ]).exec();
  }
};

// Add middleware for validation and data cleaning
niftyDataSchema.pre('save', function(next) {
  if (!this.stocks || !Array.isArray(this.stocks) || this.stocks.length === 0) {
    return next(new Error('Stocks array cannot be empty'));
  }

  // Ensure unique symbols in the stocks array
  const symbols = new Set();
  const duplicates = [];
  
  this.stocks.forEach(stock => {
    if (symbols.has(stock.symbol)) {
      duplicates.push(stock.symbol);
    }
    symbols.add(stock.symbol);
  });

  if (duplicates.length > 0) {
    return next(new Error(`Duplicate symbols found: ${duplicates.join(', ')}`));
  }

  next();
});

// Add error handling middleware
niftyDataSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicate key error'));
  } else {
    next(error);
  }
});

const NiftyData = mongoose.model('NiftyData', niftyDataSchema);

// Create indexes in background
NiftyData.createIndexes().catch(console.error);

export default NiftyData;