// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   subscriptionPlanId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SubscriptionPlan",
//     required: true
//   },
//   availableBalance: {
//     type: Number,
//     required: true,
//     default: 0
//   },
//   numberOfShares: {
//     type: Number,
//     required: true,
//     default: 0
//   },
//   nifty50Id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "NiftyData",
//     required: true,
//   },
//   Nifty500DataId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Nifty500Data",
//     required: true,
//   },
//   NiftyETFDataId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "NiftyETFData",
//     required: true,
//   },
//   type: { type: String, enum: ["buy", "sell"], required: true },
//   price: { type: Number, required: true },
//   quantity: { type: Number, required: true },
//   total: { type: Number, required: true },
//   date: { type: Date, default: Date.now }
// }, {
//   timestamps: true
// });

// transactionSchema.pre('save', async function (next) {
//   const subscriptionPlan = await mongoose.model('SubscriptionPlan').findById(this.subscriptionPlanId);
//   if (subscriptionPlan) {
//     this.availableBalance = subscriptionPlan.vertualAmount;
//   }
//   next();
// });

// export default mongoose.model("Transaction", transactionSchema);


import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subscriptionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  availableBalance:{
    type:String,
    require:true
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to validate transaction data
transactionSchema.pre("save", async function (next) {
  const subscriptionPlan = await mongoose.model("SubscriptionPlan").findById(this.subscriptionPlanId);

  if (this.type === "buy" && this.total > subscriptionPlan.vertualAmount) {
    next(new Error("Insufficient balance to place buy order"));
    return;
  }

  if (this.type === "sell" && this.quantity > subscriptionPlan.holdings) {
    next(new Error("Insufficient holdings to place sell order"));
    return;
  }

  next();
});

// Post-save middleware to update user's subscription plan balance
transactionSchema.post("save", async function (doc) {
  const subscriptionPlan = await mongoose.model("SubscriptionPlan").findById(doc.subscriptionPlanId);

  if (doc.type === "buy") {
    subscriptionPlan.vertualAmount -= doc.total; // Deduct from balance
    subscriptionPlan.holdings += doc.quantity; // Add to holdings
  } else if (doc.type === "sell") {
    subscriptionPlan.vertualAmount += doc.total; // Add to balance
    subscriptionPlan.holdings -= doc.quantity; // Deduct from holdings
  }

  await subscriptionPlan.save();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;