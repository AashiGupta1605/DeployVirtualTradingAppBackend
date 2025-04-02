// razor pay

import Event from '../../../models/EventModal.js';
import EventRegistration from '../../../models/EventRegistrationModal.js';
import Payment from '../../../models/PaymentModal.js';
import User from '../../../models/UserModal.js';
import SubscriptionPlan from "../../../models/SubscriptionPlanModal.js";
import razorpay from "../../../helpers/razorPay.js";
import crypto from 'crypto';
import sendEmail from "../../../utils/emailController.js"
import sendPaymentStatusEmail from "../../../utils/sendPaymentStatusEmail.js";
/**
 * @desc    Create Razorpay order and initial payment record
 * @route   POST /api/user/payment/create-order
 * @access  Private
 */
export const createOrder = async (req, res) => {
  const { userId, amount, subscriptionData } = req.body;

  try {
if (!userId || !amount || !subscriptionData?.plan || !subscriptionData?.duration) {
  console.log('Received data:', { userId, amount, subscriptionData });
  return res.status(400).json({
    success: false,
    message: 'Missing required fields: userId, amount, or subscription data with plan and duration'
  });
}

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan: subscriptionData.plan,
        duration: subscriptionData.duration
      },
      payment_capture: 1 // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = new Payment({
      userId,
      amount,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'Created',
      planName: subscriptionData.plan,
      duration: subscriptionData.duration,
      paymentDetails: order // Store full order details
    });

    await payment.save();

    res.status(201).json({
      success: true,
      order,
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * @desc    Verify Razorpay payment and create subscription
 * @route   POST /api/user/payment/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    paymentId, // The ID from our Payment model
    subscriptionData,
    userId
  } = req.body;

  try {
    // Find the existing payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      console.log('Payment not found for ID:', paymentId);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      payment.status = 'Failed';
      payment.paymentDetails = { 
        ...payment.paymentDetails,
        verificationError: 'Signature mismatch'
      };
      await payment.save();

      await sendPaymentStatusEmail(
        userId, 
        payment, 
        subscriptionData, 
        'signature_mismatch', 
        'Payment signature mismatch'
      );


      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Create subscription
    const subscription = new SubscriptionPlan({
      ...subscriptionData,
      userId,
      status: 'Active',
      paymentStatus: 'Completed',
      paymentId: payment._id
    });
    await subscription.save();

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'Paid';
    payment.subscriptionId = subscription._id;
    payment.paymentDetails = {
      ...payment.paymentDetails,
      razorpayPaymentId: razorpay_payment_id,
      verification: 'success'
    };
    payment.updatedAt = new Date();
    await payment.save();
    
    // new one
    // await sendPaymentStatusEmail(userId, payment, subscriptionData, 'success');
    setTimeout(async () => {
      try {
        await sendPaymentStatusEmail(userId, payment, subscriptionData, 'success');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }, 2000);
    
    // adding mail for success transaction
    // try {
    //   const user = await User.findById(userId).select('email');
    //   if (!user) {
    //     return res.status(404).json({
    //       success: false,
    //       message: 'User not found'
    //     });
    //   }
    //   const emailSubject = `Payment Confirmation - ${subscriptionData.plan} Subscription`;
    //   const emailMessage = `
    //     <p>Thank you for subscribing to our <strong>${subscriptionData.plan}</strong> plan!</p>
    //     <p><strong>Payment Details:</strong></p>
    //     <ul>
    //       <li>Amount: ₹${payment.amount}</li>
    //       <li>Plan: ${subscriptionData.plan}</li>
    //       <li>Duration: ${subscriptionData.duration}</li>
    //       <li>Order ID: ${razorpay_order_id}</li>
    //     </ul>
    //     <p>Your subscription is now active. You can access all premium features immediately.</p>
    //   `;

    //   await sendEmail(user.email, emailSubject, emailMessage);
    //   console.log(`Confirmation email sent to ${userEmail}`);
    // } catch (emailError) {
    //   console.error('Failed to send confirmation email:', emailError);
    // }

    res.json({
      success: true,
      message: 'Payment verified and subscription created',
      payment,
      subscription
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Update payment status if we have the payment record
    if (Payment) {
      Payment.status = 'Failed';
      Payment.paymentDetails = {
        ...Payment.paymentDetails,
        verificationError: error.message
      };
      await Payment.save();

      await sendPaymentStatusEmail(
        userId, 
        Payment, 
        subscriptionData, 
        'failed', 
        error.message
      );

    }

    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment details by ID
 * @route   GET /api/user/payment/:id
 * @access  Private
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('subscriptionId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
      error: error.message
    });
  }
};

/**
 * @desc    Get all payments for a user
 * @route   GET /api/user/payments/user/:userId
 * @access  Private
 */

export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('subscriptionId', 'plan duration status');

    res.json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user payments',
      error: error.message
    });
  }
};

// controllers/user/userPayment/userPaymentController.js

// Add these new methods to your existing payment controller

export const createEventOrder = async (req, res) => {
  const { userId, eventId, amount } = req.body;

  try {
    console.log('Creating event order with:', { userId, eventId, amount });

    // Validate input
    if (!userId || !eventId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, eventId, or amount'
      });
    }

    // Verify the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Validate amount matches event entry fee
    if (amount !== event.entryFee) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match event entry fee'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `event_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        eventId: eventId.toString(),
        eventTitle: event.title
      },
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      userId,
      amount,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'Created',
      paymentDetails: order,
      paymentMethod: 'Razorpay',
      planName: `Event: ${event.title}`
    });

    await payment.save();

    // Create event registration record
    const registration = new EventRegistration({
      userId,
      eventId,
      paymentId: payment._id,
      entryFee: amount,
      status: 'Pending'
    });

    await registration.save();

    res.status(201).json({
      success: true,
      order,
      paymentId: payment._id,
      registrationId: registration._id
    });

  } catch (error) {
    console.error('Create event order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event payment order',
      error: error.message
    });
  }
};

export const verifyEventPayment = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    paymentId,
    registrationId,
    userId,
    eventId
  } = req.body;
  

  try {
    // Find the existing payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      payment.status = 'Failed';
      payment.paymentDetails = { 
        ...payment.paymentDetails,
        verificationError: 'Signature mismatch'
      };
      await payment.save();

      // Update registration status
      await EventRegistration.findByIdAndUpdate(registrationId, {
        status: 'Cancelled'
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'Paid';
    payment.updatedAt = new Date();
    await payment.save();

    // Update registration status
    const registration = await EventRegistration.findByIdAndUpdate(
      registrationId,
      {
        status: 'Registered'
      },
      { new: true }
    ).populate('eventId');

    // Update event participants count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { participants: 1 }
    });

    // Send confirmation email
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (user && event) {
      const emailSubject = `Registration Confirmation - ${event.title}`;
      const emailMessage = `
        <p>Thank you for registering for <strong>${event.title}</strong>!</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Event: ${event.title}</li>
          <li>Date: ${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}</li>
          <li>Entry Fee: ₹${payment.amount}</li>
          <li>Payment ID: ${razorpay_payment_id}</li>
        </ul>
        <p>You can now access the event from your dashboard.</p>
      `;

      await sendEmail(user.email, emailSubject, emailMessage);
    }

    res.json({
      success: true,
      message: 'Payment verified and event registration completed',
      payment,
      registration
    });

  } catch (error) {
    console.error('Event payment verification error:', error);
    
    // Update payment status if we have the payment record
    if (payment) {
      payment.status = 'Failed';
      payment.paymentDetails = {
        ...payment.paymentDetails,
        verificationError: error.message
      };
      await payment.save();

      // Update registration status
      await EventRegistration.findByIdAndUpdate(registrationId, {
        status: 'Cancelled'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Event payment verification failed',
      error: error.message
    });
  }
};