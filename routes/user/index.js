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
import complaintRoutes from './complaint/complaintRoutes.js';
import statsRoute from "./stats/statsRoute.js"
import certificateRoute from "./certificate/certificateRoute.js"
const router = express.Router();

// Auth Routes
router.use('/auth', authRoutes);

// Profile Routes
router.use('/', userRoutes);

// Feedback Routes
router.use('/feedback', feedbackRoutes);

//Complaint Routes
router.use('/complaint' , complaintRoutes);

// Contact Routes
router.use('/contact', contactRoutes);

// Subscription Routes
router.use('/subscription', subscriptionRoutes);

router.use('/', userTradingRoute);
// trading route

router.use('/payment', userPayment);

router.use('/', userEventRoutes);
// payment route


// user stats route 

router.use('/stats', statsRoute);



// user certificate route
router.use('/certificates', certificateRoute );










export default router;