// models/NiftyDataModal.js

import mongoose from 'mongoose';
import { initializeCollectionIndexes } from '../utils/indexManager.js';

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    trim: true
  },
  open: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  dayHigh: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  dayLow: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  lastPrice: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  previousClose: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  change: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  pChange: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  totalTradedVolume: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  totalTradedValue: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  lastUpdateTime: {
    type: String,
    required: true
  },
  yearHigh: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  yearLow: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number'
    }
  },
  perChange365d: {
    type: Number,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || Number.isFinite(v);
      },
      message: '{VALUE} is not a valid number'
    }
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
    default: null,
    validate: {
      validator: function(v) {
        return v === null || Number.isFinite(v);
      },
      message: '{VALUE} is not a valid number'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false,
  timestamps: false
});

const niftyDataSchema = new mongoose.Schema({
  fetchTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  stocks: [stockSchema]
}, {
  timestamps: true,
  collection: 'niftydatas'
});

// Static Methods
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

// Pre-save middleware
niftyDataSchema.pre('save', function(next) {
  if (!this.stocks?.length) {
    next(new Error('Stocks array cannot be empty'));
    return;
  }

  // Check for duplicate symbols
  const symbols = new Set();
  for (const stock of this.stocks) {
    if (symbols.has(stock.symbol)) {
      next(new Error(`Duplicate symbol found: ${stock.symbol}`));
      return;
    }
    symbols.add(stock.symbol);
  }

  next();
});

// Post-save middleware
niftyDataSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicate key error'));
  } else {
    next(error);
  }
});

const NiftyData = mongoose.model('NiftyData', niftyDataSchema);

// Initialize indexes
const initializeIndexes = async () => {
  try {
    const indexSpec = {
      fields: { fetchTime: -1, 'stocks.symbol': 1 },
      options: {
        background: true,
        name: 'idx_nifty50_fetch_symbol'
      }
    };

    await initializeCollectionIndexes(
      NiftyData.collection,
      'idx_nifty50_fetch_symbol',
      indexSpec
    );
  } catch (error) {
    console.error('❌ Error initializing NiftyData indexes:', error);
  }
};

// Initialize indexes when the model is first loaded
if (mongoose.connection.readyState === 1) {
  initializeIndexes().catch(console.error);
} else {
  mongoose.connection.once('connected', () => {
    initializeIndexes().catch(console.error);
  });
}

export default NiftyData;