// controllers/user/userTrading/userTradingController.js

import Transaction from '../../../models/TransactionModal.js';
import Holding from '../../../models/Holding.js';
import SubscriptionPlan from '../../../models/SubscriptionPlanModal.js';

export const tradeStock = async (req, res) => {
  try {
    const { 
      userId, 
      subscriptionPlanId, 
      companySymbol, 
      numberOfShares, 
      price,
      orderType = 'market',
      type, // 'buy' or 'sell'
      total
    } = req.body;

    let transaction;
    let holding;

    // Validate required fields
    if (!userId || !subscriptionPlanId || !companySymbol || !numberOfShares || !price || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check subscription
    const subscription = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!subscription || subscription.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive subscription'
      });
    }

    // Find existing holding
    holding = await Holding.findOne({ 
      userId, 
      subscriptionPlanId, 
      companySymbol 
    });

    // Create transaction data
    const transactionData = {
      userId,
      subscriptionPlanId,
      companySymbol,
      type,
      numberOfShares,
      price,
      total,
      orderType,
      status: 'completed'
    };

    if (type === 'buy') {
      // Check balance for buy
      if (total > subscription.vertualAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      // Create transaction
      transaction = await Transaction.create(transactionData);

      // Update or create holding
      if (holding) {
        // Update existing holding
        const totalShares = holding.quantity + numberOfShares;
        const totalValue = (holding.quantity * holding.averageBuyPrice) + total;
        holding.quantity = totalShares;
        holding.averageBuyPrice = totalValue / totalShares;
        holding.lastUpdated = new Date();
        await holding.save();
      } else {
        // Create new holding
        holding = await Holding.create({
          userId,
          subscriptionPlanId,
          companySymbol,
          quantity: numberOfShares,
          averageBuyPrice: price
        });
      }

      // Update subscription balance (subtract for buy)
      subscription.vertualAmount -= total;

    } else if (type === 'sell') {
      // Check if user has enough shares to sell
      if (!holding || holding.quantity < numberOfShares) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient shares to sell'
        });
      }

      // Create transaction
      transaction = await Transaction.create(transactionData);

      // Update holding
      holding.quantity -= numberOfShares;
      if (holding.quantity === 0) {
        await Holding.findByIdAndDelete(holding._id);
        holding = null;
      } else {
        await holding.save();
      }

      // Update subscription balance (add for sell)
      subscription.vertualAmount += total;
    }

    // Save subscription changes
    await subscription.save();

    // Fetch updated holdings for response
    const updatedHoldings = await Holding.find({ 
      userId, 
      subscriptionPlanId 
    });

    res.status(200).json({
      success: true,
      transaction,
      holdings: updatedHoldings,
      holding,
      balance: subscription.vertualAmount
    });

  } catch (error) {
    console.error('Trade stock error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const getHoldings = async (req, res) => {
  try {
    const { userId, subscriptionPlanId } = req.params;
    const holdings = await Holding.find({ userId, subscriptionPlanId });
    res.status(200).json(holdings);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch transactions with populated subscription plan details
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch current holdings
    const holdings = await Holding.find({ userId }).lean();

    res.status(200).json({
      transactions,
      holdings
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch transaction history", 
      error: error.message 
    });
  }
};