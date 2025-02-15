import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  symbol: String,
  open: Number,
  dayHigh: Number,
  dayLow: Number,
  lastPrice: Number,
  previousClose: Number,
  change: Number,
  pChange: Number,
  totalTradedVolume: Number,
  totalTradedValue: Number,
  lastUpdateTime: String,
  yearHigh: Number,
  yearLow: Number,
  perChange365d: Number,
  date365dAgo: String,
  date30dAgo: String,
  perChange30d: Number,
  timestamp: String,
});

const batchSchema = new mongoose.Schema({
  fetchTime: { type: Date, default: Date.now },
  stocks: [stockSchema],
});

const NiftyETFData = mongoose.model('NiftyETFData', batchSchema);

export default NiftyETFData;