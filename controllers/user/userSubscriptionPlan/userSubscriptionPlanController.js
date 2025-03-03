// controllers/user/userSubscriptionPlan/userSubscriptionPlanController.js
import SubscriptionPlan from '../../../models/SubscriptionPlanModal.js';
import User from '../../../models/UserModal.js';

// Create new subscription plan
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { userId, plan, vertualAmount, duration, startDate, endDate } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user already has an active subscription
    const existingActivePlan = await SubscriptionPlan.findOne({
      userId,
      status: 'Active'
    });

    if (existingActivePlan) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has an active subscription plan'
      });
    }

    // Create new subscription plan
    const subscriptionPlan = await SubscriptionPlan.create({
      userId,
      plan,
      vertualAmount,
      duration,
      startDate,
      endDate,
      status: 'Active',
      paymentStatus: 'Completed'
    });

    res.status(201).json({
      status: 'success',
      data: subscriptionPlan
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get subscription plan by ID
export const getSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id)
      .populate('userId', 'name email');

    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription plan not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's subscription plans
// controllers/user/userSubscriptionPlan/userSubscriptionPlanController.js

export const getUserSubscriptionPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching subscriptions for userId:', userId);

    const plans = await SubscriptionPlan.find({ 
      userId,
      isDeleted: false  // Only fetch non-deleted plans
    })
    .populate('userId', 'name email')
    .sort('-createdDate');

    console.log('Found plans:', plans);

    res.status(200).json({
      status: 'success',
      results: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Error in getUserSubscriptionPlans:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update subscription plan
// controllers/user/userSubscriptionPlan/userSubscriptionPlanController.js

export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription plan not found'
      });
    }

    // Prevent updating certain fields
    delete updateData.userId;
    delete updateData.paymentStatus;
    delete updateData.isDeleted;
    
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedDate: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Failed to update subscription plan'
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedPlan
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Cancel subscription plan
export const cancelSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findOne({
      _id: id,
      isDeleted: false // Only find non-deleted plans
    });

    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription plan not found'
      });
    }

    // Update the plan status and isDeleted flag
    plan.status = 'Cancelled';
    plan.isDeleted = true;
    await plan.save();

    res.status(200).json({
      status: 'success',
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all subscription plans (with filters)
export const getAllSubscriptionPlans = async (req, res) => {
  try {
    const query = { isDeleted: false }; // Base query to exclude deleted plans

    // Add filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.plan) query.plan = req.query.plan;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const plans = await SubscriptionPlan.find(query)
      .populate('userId', 'name email')
      .sort('-createdDate');

    res.status(200).json({
      status: 'success',
      results: plans.length,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};