import Transaction from '../../../models/TransactionModal.js';
import Holding from '../../../models/Holding.js';
import User from '../../../models/UserModal.js';
import SubscriptionPlan from '../../../models/SubscriptionPlanModal.js';
import sendEmail from "../../../utils/emailController.js";
import mongoose from 'mongoose';
const PORTAL_FEE = 25;

// Migration script to run once
const fixStockTypes = async () => {
  const holdings = await Holding.find({
    $or: [
      { stockType: { $exists: false } },
      { stockType: { $nin: ['nifty50', 'nifty500', 'etf'] } }
    ]
  });
  
  for (const holding of holdings) {
    holding.stockType = 'nifty50'; // or determine from other data
    await holding.save();
  }
};


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
      currentMarketPrice,
      eventId,
      stockType
    } = req.body;

    // Validate inputs
    if (!userId || !subscriptionPlanId || !companySymbol || !numberOfShares || !price) {
      throw new Error('Missing required fields');
    }

    if (!['buy', 'sell'].includes(type)) {
      throw new Error('Invalid trade type');
    }

    // For buy orders, stockType is required
    if (type === 'buy' && !['nifty50', 'nifty500', 'etf'].includes(stockType)) {
      throw new Error('Invalid stock type for purchase');
    }

    // Fetch user and subscription
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    const subscription = await SubscriptionPlan.findById(subscriptionPlanId).session(session);
    if (!subscription || subscription.status !== 'Active') {
      throw new Error('Invalid or inactive subscription');
    }

    // Normalize symbol
    const normalizedSymbol = companySymbol.toUpperCase();
    const totalWithFee = type === 'buy' ? total + PORTAL_FEE : total - PORTAL_FEE;

    let transaction;
    let holding;

    // Handle buy order
    if (type === 'buy') {
      if (totalWithFee > subscription.vertualAmount) {
        throw new Error('Insufficient balance');
      }

      // Update subscription balance
      subscription.vertualAmount -= totalWithFee;
      await subscription.save({ session });

      // Find or create holding
      holding = await Holding.findOne({
        userId,
        subscriptionPlanId,
        companySymbol: normalizedSymbol,
        ...(eventId ? { eventId } : { $or: [{ eventId: null }, { eventId: { $exists: false } }] })
      }).session(session);

      if (holding) {
        const totalShares = holding.quantity + numberOfShares;
        const totalValue = (holding.quantity * holding.averageBuyPrice) + total;
        holding.quantity = totalShares;
        holding.averageBuyPrice = totalValue / totalShares;
        holding.stockType = stockType;
        await holding.save({ session });
      } else {
        holding = await Holding.create([{
          userId,
          subscriptionPlanId,
          companySymbol: normalizedSymbol,
          quantity: numberOfShares,
          averageBuyPrice: price,
          stockType,
          eventId
        }], { session });
      }

      // Create transaction
      transaction = await Transaction.create([{
        userId,
        subscriptionPlanId,
        companySymbol: normalizedSymbol,
        type: 'buy',
        stockType,
        numberOfShares,
        price,
        total,
        portalFee: PORTAL_FEE,
        totalWithFee,
        orderType,
        status: 'completed',
        eventId
      }], { session });
    }

    // Handle sell order
    if (type === 'sell') {
      // Find holding (case-insensitive with more flexible matching)
      holding = await Holding.findOne({
        userId,
        subscriptionPlanId,
        companySymbol: { $regex: new RegExp(`^${normalizedSymbol}$`, 'i') },
        ...(eventId ? { eventId } : { $or: [{ eventId: null }, { eventId: { $exists: false } }] })
      }).session(session);

      if (!holding) {
        throw new Error(`You don't have any ${normalizedSymbol} shares to sell`);
      }

      if (holding.quantity < numberOfShares) {
        throw new Error(`Insufficient shares. You only have ${holding.quantity} shares of ${normalizedSymbol}`);
      }

      // Ensure stockType exists and is valid
      if (!holding.stockType) {
        holding.stockType = 'nifty50'; // Default value
      }
      
      const normalizedStockType = holding.stockType.toLowerCase();
      if (!['nifty50', 'nifty500', 'etf'].includes(normalizedStockType)) {
        throw new Error(`Invalid stock type in your holdings`);
      }

      // Update subscription balance
      subscription.vertualAmount += totalWithFee;
      await subscription.save({ session });

      // Update or delete holding
      holding.quantity -= numberOfShares;
      if (holding.quantity === 0) {
        await Holding.findByIdAndDelete(holding._id, { session });
      } else {
        await holding.save({ session });
      }

      // Create transaction
      transaction = await Transaction.create([{
        userId,
        subscriptionPlanId,
        companySymbol: normalizedSymbol,
        type: 'sell',
        stockType: normalizedStockType,
        numberOfShares,
        price,
        total,
        portalFee: PORTAL_FEE,
        totalWithFee,
        orderType,
        status: 'completed',
        eventId
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    // Send email notification
    try {
      const action = type === 'buy' ? 'purchased' : 'sold';
      const emailMessage = `You have successfully ${action} ${numberOfShares} shares of ${normalizedSymbol}`;
      await sendEmail(user.email, 'Trade Confirmation', emailMessage);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    return res.status(200).json({
      success: true,
      transaction: transaction[0],
      holding: holding ? holding.toObject() : null,
      balance: subscription.vertualAmount
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Trade error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ... rest of the controller methods remain the same ...

export const getHoldings = async (req, res) => {
  try {
    const { userId, subscriptionPlanId, eventId } = req.params;
    
    // Validate inputs
    if (!userId || !subscriptionPlanId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Subscription Plan ID are required'
      });
    }

    // Build query object
    const query = { 
      userId, 
      subscriptionPlanId 
    };

    // Handle eventId variations
    if (eventId === 'none') {
      query.$or = [
        { eventId: null },
        { eventId: { $exists: false } }
      ];
    } else if (eventId && eventId !== 'null' && eventId !== 'undefined') {
      query.eventId = eventId;
    }

    const holdings = await Holding.find(query).sort({ companySymbol: 1 });

    // Calculate current value for each holding
    const holdingsWithValues = await Promise.all(holdings.map(async (holding) => {
      // In a real app, you'd fetch current price from your market data
      // For now, we'll just return the holding as-is
      return {
        ...holding.toObject(),
        currentValue: holding.quantity * holding.averageBuyPrice // This should be current price
      };
    }));

    res.status(200).json({
      success: true,
      holdings: holdingsWithValues
    });
  } catch (error) {
    console.error('Get Holdings Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Build query object
    const query = { userId };

    // Handle eventId variations
    if (eventId === 'none') {
      query.$or = [
        { eventId: null },
        { eventId: { $exists: false } }
      ];
    } else if (eventId && eventId !== 'null' && eventId !== 'undefined') {
      query.eventId = eventId;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get relevant holdings based on the same criteria
    const holdingsQuery = { userId };
    if (eventId === 'none') {
      holdingsQuery.$or = [
        { eventId: null },
        { eventId: { $exists: false } }
      ];
    } else if (eventId && eventId !== 'null' && eventId !== 'undefined') {
      holdingsQuery.eventId = eventId;
    }

    const holdings = await Holding.find(holdingsQuery).lean();

    res.status(200).json({
      success: true,
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

export const getEventSpecificTransactions = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and User ID are required'
      });
    }

    // Get transactions only for this specific event
    const transactions = await Transaction.find({ 
      userId,
      eventId 
    }).sort({ createdAt: -1 });

    // Get holdings only for this specific event
    const holdings = await Holding.find({
      userId,
      eventId
    });

    res.status(200).json({
      success: true,
      transactions,
      holdings
    });
  } catch (error) {
    console.error('Get Event Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};