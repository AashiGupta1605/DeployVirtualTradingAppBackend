import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  planPrice: {
    type: Number,
    required: true,
  },
  plan: { 
    type: String, 
    enum: ["Gold", "Silver", "Platinum", "Diamond"], 
    required: true 
  },
  vertualAmount: { type: Number, required: true },
  duration: { 
    type: String, 
    enum: ["1 Month", "3 Months", "6 Months"], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["Active", "Expired", "Cancelled"], default: "Active" },
  paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  isDeleted: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  tradingPreference: { 
    type: String, 
    enum: ["Market Hours", "Off-Market Hours"], 
    default: "Market Hours" 
  }
});

// Middleware to update `updatedDate` on document update
subscriptionPlanSchema.pre("save", function (next) {
  this.updatedDate = Date.now();
  next();
});

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);


