// models/Holding.js
import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscriptionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true
  },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  companySymbol: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  averageBuyPrice: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  stockType: {
    type: String,
    required: true,
    enum: ['nifty50', 'nifty500', 'etf'],
    default: 'nifty50'
  }
});

export default mongoose.model("Holding", holdingSchema);