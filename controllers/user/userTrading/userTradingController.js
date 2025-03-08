// routes/transaction.js
import Transaction from "../../../models/TransactionModal.js";
import User from "../../../models/TransactionModal.js";


// Buy stock
export const buyStock = async (req, res) => {
  const { userId, stock, quantity, price, total } = req.body;

  try {
    const user = await User.findById(userId);
    if (user.balance < total) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transaction = new Transaction({
      userId,
      stock,
      type: "buy",
      quantity,
      price,
      total
    });

    await transaction.save();

    user.balance -= total;
    user.holdings += quantity;
    await user.save();

    res.status(201).json({ message: "Buy order placed successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to place buy order", error });
  }
};

// Sell stock
export const sellStock =  async (req, res) => {
  const { userId, stock, quantity, price, total } = req.body;

  try {
    const user = await User.findById(userId);
    if (user.holdings < quantity) {
      return res.status(400).json({ message: "Insufficient holdings" });
    }

    const transaction = new Transaction({
      userId,
      stock,
      type: "sell",
      quantity,
      price,
      total
    });

    await transaction.save();

    user.balance += total;
    user.holdings -= quantity;
    await user.save();

    res.status(201).json({ message: "Sell order placed successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to place sell order", error });
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
