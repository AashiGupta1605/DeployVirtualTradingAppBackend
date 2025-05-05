import Transaction from '../../../models/TransactionModal.js';
import Holding from '../../../models/Holding.js';
import User from '../../../models/UserModal.js';
import SubscriptionPlan from '../../../models/SubscriptionPlanModal.js';
import sendEmail from "../../../utils/emailController.js";
import mongoose from 'mongoose';
const PORTAL_FEE = 25;

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
      eventId
    } = req.body;

    // Add validation for subscriptionPlanId
    if (!mongoose.Types.ObjectId.isValid(subscriptionPlanId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan ID'
      });
    }

    // Fetch user details for email notification
    const user = await User.findById(userId);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Comprehensive validation
    const validationErrors = [];
    if (!userId) validationErrors.push('User ID is required');
    if (!subscriptionPlanId) validationErrors.push('Subscription Plan ID is required');
    if (!companySymbol) validationErrors.push('Company Symbol is required');
    if (numberOfShares <= 0) validationErrors.push('Number of shares must be positive');
    if (price <= 0) validationErrors.push('Price must be positive');
    if (!['buy', 'sell'].includes(type)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: [`Invalid trade type: ${type}. Must be either 'buy' or 'sell'`]
      });
    }
    if (!['market', 'limit', 'stop_loss', 'stop_buy'].includes(orderType)) validationErrors.push('Invalid order type');

    if (validationErrors.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }

    // Find subscription
    const subscription = await SubscriptionPlan.findById(subscriptionPlanId).session(session);
    if (!subscription || subscription.status !== 'Active') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid or inactive subscription' });
    }

    let transaction;
    let emailSubject = "";
    let emailMessage = "";

    // Normalize company symbol to uppercase for consistency
    const normalizedSymbol = companySymbol.toUpperCase();
    
    const totalWithFee = type === 'buy' 
      ? total + PORTAL_FEE  // Add fee for buying
      : total - PORTAL_FEE; // Subtract fee for selling

    // **BUY LOGIC**
    if (type === 'buy') {
      // Check if user has enough balance including fee
      if (totalWithFee > subscription.vertualAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient balance (including portal fee)' 
        });
      }

      // Deduct balance including fee
      subscription.vertualAmount -= totalWithFee;
      await subscription.save({ session });



      // Find or create holding - case insensitive search
      let holding = await Holding.findOne({ 
        userId, 
        subscriptionPlanId, 
        companySymbol: { $regex: new RegExp(`^${normalizedSymbol}$`, 'i') },
        ...(eventId ? { eventId } : { $or: [{ eventId: null }, { eventId: { $exists: false } }] })
      }).session(session);

      if (holding) {
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
          companySymbol: normalizedSymbol,
          quantity: numberOfShares,
          averageBuyPrice: price,
          eventId // Include eventId in holding if provided
        }], { session });
      }

      // Create transaction
      transaction = await Transaction.create([{
        userId,
        subscriptionPlanId,
        companySymbol: normalizedSymbol,
        type: 'buy',
        numberOfShares,
        price,
        total,
        portalFee: PORTAL_FEE,
        totalWithFee,
        orderType,
        status: 'completed',
        eventId
      }], { session });

      emailSubject = "Trade Confirmation: Stock Buy";
      emailMessage = `
        Dear ${user.name},<br><br>
        You have successfully purchased <strong>${numberOfShares} shares</strong> of <strong>${normalizedSymbol}</strong> at <strong>₹${price.toFixed(2)} per share</strong>.
        <br>
        Stock Cost: <strong>₹${total.toFixed(2)}</strong>
        <br>
        Portal Fee: <strong>₹${PORTAL_FEE.toFixed(2)}</strong>
        <br>
        Total Cost (including fee): <strong>₹${totalWithFee.toFixed(2)}</strong>
        <br><br>
        Thank you for trading with us.
      `;
    }

    // **SELL LOGIC**
    if (type === 'sell') {
      // Find holding with the same criteria used during buy - case insensitive
      console.log('Sell Order - Looking for holdings with:', {
        userId,
        subscriptionPlanId,
        companySymbol: normalizedSymbol,
        eventId
      });
      
      const holding = await Holding.findOne({
        userId,
        subscriptionPlanId,
        companySymbol: { $regex: new RegExp(`^${normalizedSymbol}$`, 'i') },
        ...(eventId ? { eventId } : { $or: [{ eventId: null }, { eventId: { $exists: false } }] })
      }).session(session);
      
      console.log('Found holding:', holding);
    
      if (!holding) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: `No holdings found for ${normalizedSymbol}`,
          availableHoldings: await Holding.find({ userId, subscriptionPlanId })
        });
      }
    
      if (holding.quantity < numberOfShares) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient shares to sell. You only have ${holding.quantity} shares of ${normalizedSymbol}`,
          availableShares: holding.quantity
        });
      }
    
      // Add balance
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
        numberOfShares,
        price,
        total,
        portalFee: PORTAL_FEE,
        totalWithFee,
        orderType,
        status: 'completed',
        eventId
      }], { session });

      emailSubject = "Trade Confirmation: Stock Sell";
      emailMessage = `
        Dear ${user.name},<br><br>
        You have successfully sold <strong>${numberOfShares} shares</strong> of <strong>${normalizedSymbol}</strong> at <strong>₹${price.toFixed(2)} per share</strong>.
        <br>
        Stock Proceeds: <strong>₹${total.toFixed(2)}</strong>
        <br>
        Portal Fee: <strong>₹${PORTAL_FEE.toFixed(2)}</strong>
        <br>
        Net Proceeds (after fee): <strong>₹${totalWithFee.toFixed(2)}</strong>
        <br><br>
        Thank you for trading with us.
      `;
    }

    await session.commitTransaction();
    session.endSession();

    // Send Email Notification
    try {
      await sendEmail(user.email, emailSubject, emailMessage);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    // Get updated holdings
    const updatedHoldings = await Holding.find({ 
      userId, 
      subscriptionPlanId,
      ...(eventId ? { eventId } : { $or: [{ eventId: null }, { eventId: { $exists: false } }] })
    });

    return res.status(200).json({
      success: true,
      transaction: transaction[0],
      holdings: updatedHoldings,
      balance: subscription.vertualAmount,
      message: `Trade ${type} successful. Confirmation email sent.`,
    });

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