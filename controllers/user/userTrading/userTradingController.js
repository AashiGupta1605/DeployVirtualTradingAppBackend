import Transaction from '../../../models/TransactionModal.js';
import User from '../../../models/UserModal.js';
import SubscriptionPlan from '../../../models/SubscriptionPlanModal.js';

// Buy stock
export const buySellStock = async (req, res) => {
  const { userId, subscriptionPlanId, stock, quantity, price, total, type } = req.body;

  try {
    const user = await User.findById(userId);
    const subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);

    if (!user || !subscriptionPlan) {
      return res.status(404).json({ message: "User or subscription plan not found" });
    }

    if (subscriptionPlan.vertualAmount < total) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transaction = new Transaction({
      userId,
      subscriptionPlanId,
      stock,
      type,
      quantity,
      price,
      total
    });

    await transaction.save();

    subscriptionPlan.vertualAmount -= total;
    await subscriptionPlan.save();

    res.status(201).json({ message: "Buy order placed successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to place buy order", error });
  }
};



// Get transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction history", error });
  }
};