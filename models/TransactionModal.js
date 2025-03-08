// models/Transaction.js
// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   stock: { type: String, required: true }, 
  // type: { type: String, enum: ["buy", "sell"], required: true },
//   quantity: { type: Number, required: true },
//   price: { type: Number, required: true },
//   total: { type: Number, required: true },
//   date: { type: Date, default: Date.now }
// });

// export default mongoose.model("Transaction", transactionSchema);


import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
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
  availableBalance: {
    type: Number,
    required: true,
    default: 0
  },
  numberOfShares: { //quantity
    type: Number,
    required: true,
    default: 0
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  companySymbol: {
    type: String,
    required: true
  },
  // company type
  type: { type: String, enum: ["buy", "sell"], required: true },
  price: { type: Number, required: true },
}, {
  timestamps: true
});

// Middleware to update availableBalance based on the SubscriptionPlan's virtualAmount
transactionSchema.pre('save', async function (next) {
  const subscriptionPlan = await mongoose.model('SubscriptionPlan').findById(this.subscriptionPlanId);
  if (subscriptionPlan) {
    this.availableBalance = subscriptionPlan.virtualAmount;
  }
  next();
});

export default mongoose.model("Transaction", transactionSchema);