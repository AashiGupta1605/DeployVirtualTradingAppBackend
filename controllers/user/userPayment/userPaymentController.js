// import Payment from "../../../models/PaymentModal.js";
// import SubscriptionPlan from "../../../models/SubscriptionPlanModal.js";
// import gateway from "../../../helpers/braintree.js";
// // Configure Braintree

// // Generate client token
// export const generateClientToken = async (req, res) => {
//   try {
//     const response = await gateway.clientToken.generate({});
//     res.send(response.clientToken);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

// // Process payment

// // Process payment


// export const processPayment = async (req, res) => {
//     const { userId, paymentMethodNonce, amount, subscriptionData } = req.body;
  
//     try {
//       // Validate required fields
//       if (!paymentMethodNonce || !amount || !subscriptionData) {
//         return res.status(400).send("Missing required fields.");
//       }
  
//       // Create a transaction in Braintree
//       const result = await gateway.transaction.sale({
//         amount: amount.toString(), // Convert to string (Braintree expects a string)
//         paymentMethodNonce: paymentMethodNonce,
//           paymentMethodNonce: paymentMethodNonce,
//          merchantAccountId: process.env.MERCHANT_ID,
//         options: {
//           submitForSettlement: true,
//         },
//       });
  
//       if (result.success) {
//         // Save payment details in the database
//         const payment = new Payment({
//           userId,
//           paymentMethod: "Braintree",
//           amount,
//           transactionId: result.transaction.id,
//           status: "Completed",
//         });
//         await payment.save();
  
//         // Create subscription plan
//         const subscription = new SubscriptionPlan({
//           ...subscriptionData,
//           userId,
//           status: "Active",
//         });
//         await subscription.save();
  
//         res.send("Payment and subscription successful!");
//       } else {
//         console.error("Braintree Transaction Error:", result.message);
//         res.status(500).send("Payment failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Server Error:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   };




// controllers/user/userPayment/userPaymentController.js
// import Payment from "../../../models/PaymentModal.js";
// import SubscriptionPlan from "../../../models/SubscriptionPlanModal.js";
// import razorpay from "../../../helpers/razorPay.js";

// // Create Razorpay order
// export const createOrder = async (req, res) => {
//   const { amount, currency = 'INR', receipt, notes } = req.body;

//   try {
//     const options = {
//       amount: amount * 100, // Razorpay expects amount in paise
//       currency,
//       receipt,
//       notes
//     };

//     const order = await razorpay.orders.create(options);
    
//     res.json({
//       success: true,
//       order
//     });
//   } catch (error) {
//     console.error('Razorpay order creation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create payment order'
//     });
//   }
// };

// // Verify payment and create subscription
// export const verifyPayment = async (req, res) => {
//   const {
//     razorpay_payment_id,
//     razorpay_order_id,
//     razorpay_signature,
//     subscriptionData,
//     userId
//   } = req.body;

//   try {
//     // Verify payment signature (you should implement proper signature verification)
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest('hex');

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment verification failed'
//       });
//     }

//     // Save payment details in the database
//     const payment = new Payment({
//       // userId,
//       // paymentMethod: "Razorpay",
//       // amount: subscriptionData.planPrice,
//       // transactionId: razorpay_payment_id,
//       // orderId: razorpay_order_id,
//       // status: "Completed",

//       userId,
//       amount: subscriptionData.planPrice,
//       currency: 'INR',
//       razorpayOrderId: order.id,
//       status: 'Created',
//       planName: subscriptionData.plan,
//       duration: subscriptionData.duration
//     });
//     await payment.save();

//     // Create subscription plan
//     const subscription = new SubscriptionPlan({
//       ...subscriptionData,
//       userId,
//       status: "Active",
//     });
//     await subscription.save();

//     res.json({
//       success: true,
//       message: 'Payment and subscription successful!'
//     });
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };





// razor pay

import Payment from "../../../models/PaymentModal.js";
import SubscriptionPlan from "../../../models/SubscriptionPlanModal.js";
import razorpay from "../../../helpers/razorPay.js";
import crypto from 'crypto';

/**
 * @desc    Create Razorpay order and initial payment record
 * @route   POST /api/user/payment/create-order
 * @access  Private
 */
export const createOrder = async (req, res) => {
  const { userId, amount, subscriptionData } = req.body;

  try {
    // Validate required fields
    // if (!userId || !amount || !subscriptionData?.plan || !subscriptionData?.duration) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Missing required fields: userId, amount, or subscription data'
    //   });
    // }
    // In createOrder controller
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