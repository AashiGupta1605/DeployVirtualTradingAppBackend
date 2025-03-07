// models/Nifty500DataModal.js

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

const nifty500DataSchema = new mongoose.Schema({
  fetchTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  stocks: [stockSchema]
}, {
  timestamps: true,
  collection: 'nifty500data'
});

// Static Methods
nifty500DataSchema.statics = {
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
  },

  async findLatestData() {
    try {
      return await this.findOne().sort({ fetchTime: -1 });
    } catch (error) {
      console.error('Error in findLatestData:', error);
      throw error;
    }
  }
};

// Pre-save middleware
nifty500DataSchema.pre('save', function(next) {
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
nifty500DataSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicate key error'));
  } else {
    next(error);
  }
});

const Nifty500Data = mongoose.model('Nifty500Data', nifty500DataSchema);

// Initialize indexes
const initializeIndexes = async () => {
  try {
    const indexSpec = {
      fields: { fetchTime: -1, 'stocks.symbol': 1 },
      options: {
        background: true,
        name: 'idx_nifty500_fetch_symbol'
      }
    };

    await initializeCollectionIndexes(
      Nifty500Data.collection,
      'idx_nifty500_fetch_symbol',
      indexSpec
    );
  } catch (error) {
    console.error('❌ Error initializing Nifty500Data indexes:', error);
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

export default Nifty500Data;