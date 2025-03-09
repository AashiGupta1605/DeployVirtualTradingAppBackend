// controllers/user/userTrading/userTradingController.js
import Transaction from "../../../models/TransactionModal.js";
import User from "../../../models/UserModal.js"; // Fix this import

export const buyStock = async (req, res) => {
  const { userId, stock, quantity, price, total } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transaction = new Transaction({
      userId,
      companySymbol: stock, // Match the model field name
      type: "buy",
      numberOfShares: quantity, // Match the model field name
      price,
      createdAt: new Date()
    });

    await transaction.save();
    res.status(201).json({ message: "Buy order placed successfully", transaction });
  } catch (error) {
    console.error('Buy order error:', error);
    res.status(500).json({ message: "Failed to place buy order", error: error.message });
  }
};

export const sellStock = async (req, res) => {
  const { userId, stock, quantity, price, total } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transaction = new Transaction({
      userId,
      companySymbol: stock, // Match the model field name
      type: "sell",
      numberOfShares: quantity, // Match the model field name
      price,
      createdAt: new Date()
    });

    await transaction.save();
    res.status(201).json({ message: "Sell order placed successfully", transaction });
  } catch (error) {
    console.error('Sell order error:', error);
    res.status(500).json({ message: "Failed to place sell order", error: error.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      userId: req.params.userId 
    }).sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: "Failed to fetch transaction history", error: error.message });
  }
};