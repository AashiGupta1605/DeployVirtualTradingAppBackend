import Transaction from '../../../models/TransactionModal.js';
import Holding from '../../../models/Holding.js';
import SubscriptionPlan from '../../../models/SubscriptionPlanModal.js';
import mongoose from 'mongoose';

export const tradeStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      userId, 
      subscriptionPlanId, 
      symbol: companySymbol, 
      numberOfShares, 
      price,
      orderType = 'market',
      type, // 'buy' or 'sell'
      total,
      currentMarketPrice
    } = req.body;

    // Comprehensive validation
    const validationErrors = [];
    if (!userId) validationErrors.push('User ID is required');
    if (!subscriptionPlanId) validationErrors.push('Subscription Plan ID is required');
    if (!companySymbol) validationErrors.push('Company Symbol is required');
    if (numberOfShares <= 0) validationErrors.push('Number of shares must be positive');
    if (price <= 0) validationErrors.push('Price must be positive');
    if (!['buy', 'sell'].includes(type)) validationErrors.push('Invalid trade type');
    if (!['market', 'limit', 'stop_loss', 'stop_buy'].includes(orderType)) validationErrors.push('Invalid order type');

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }

    // Find subscription
    const subscription = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!subscription || subscription.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive subscription'
      });
    }

    // Transaction logic
    if (type === 'buy') {
      // Check balance
      if (total > subscription.vertualAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      // Update subscription balance
      subscription.vertualAmount -= total;
      await subscription.save({ session });

      // Find or create holding
      let holding = await Holding.findOne({ 
        userId, 
        subscriptionPlanId, 
        companySymbol 
      });

      if (holding) {
        // Update existing holding
        const totalShares = holding.quantity + numberOfShares;
        const totalValue = (holding.quantity * holding.averageBuyPrice) + total;
        holding.quantity = totalShares;
        holding.averageBuyPrice = totalValue / totalShares;
        await holding.save({ session });
      } else {
        // Create new holding
        holding = await Holding.create([{
          userId,
          subscriptionPlanId,
          companySymbol,
          quantity: numberOfShares,
          averageBuyPrice: price
        }], { session });
      }

      // Create transaction
      const transaction = await Transaction.create([{
        userId,
        subscriptionPlanId,
        companySymbol,
        type: 'buy',
        numberOfShares,
        price,
        total,
        orderType,
        status: 'completed'
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        transaction: transaction[0],
        holdings: await Holding.find({ userId, subscriptionPlanId }),
        balance: subscription.vertualAmount
      });
    }

    // Sell logic
    if (type === 'sell') {
      const holding = await Holding.findOne({ 
        userId, 
        subscriptionPlanId, 
        companySymbol 
      });

      if (!holding || holding.quantity < numberOfShares) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient shares to sell'
        });
      }

      // Update subscription balance
      subscription.vertualAmount += total;
      await subscription.save({ session });

      // Update holding
      holding.quantity -= numberOfShares;
      if (holding.quantity === 0) {
        await Holding.findByIdAndDelete(holding._id, { session });
      } else {
        await holding.save({ session });
      }

      // Create transaction
      const transaction = await Transaction.create([{
        userId,
        subscriptionPlanId,
        companySymbol,
        type: 'sell',
        numberOfShares,
        price,
        total,
        orderType,
        status: 'completed'
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        transaction: transaction[0],
        holdings: await Holding.find({ userId, subscriptionPlanId }),
        balance: subscription.vertualAmount
      });
    }

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Trade Stock Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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