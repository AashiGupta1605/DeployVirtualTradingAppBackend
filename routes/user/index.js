// import express from 'express';
// // import contactRoutes from './contactRoutes.js';
// import feedbackRoutes from './feedbackRoutes.js';
// import userRoutes from "./userRoutes.js"

// const router = express.Router();

// // router.use(contactRoutes); 
// router.use(feedbackRoutes);
// router.use(userRoutes); 

// export default router;

// routes/user/index.js


import express from 'express';
import authRoutes from './auth/authRoutes.js';
import userRoutes from './user/userRoutes.js';
import feedbackRoutes from './feedback/feedbackRoutes.js';
import contactRoutes from './contact/contactRoutes.js';
import subscriptionRoutes from './userSubscriptionPlanRoutes/userSubscriptionPlanRoutes.js';
import userTradingRoute from "./userTradingRoute/userTradingRoute.js";
import userPayment from "./userPayment/userPaymentRoute.js";
import userEventRoutes from '../user/userPayment/userPaymentRoute.js';
const router = express.Router();

// Auth Routes
router.use('/auth', authRoutes);

// Profile Routes
router.use('/', userRoutes);

// Feedback Routes
router.use('/feedback', feedbackRoutes);

// Contact Routes
router.use('/contact', contactRoutes);

// Subscription Routes
router.use('/subscription', subscriptionRoutes);

router.use('/', userTradingRoute);
// trading route

router.use('/payment', userPayment);

router.use('/', userEventRoutes);
// payment route




export default router;