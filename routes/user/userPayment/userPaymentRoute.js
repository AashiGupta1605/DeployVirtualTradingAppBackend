// import express from "express";
// import {
//   generateClientToken,
//   processPayment,
// } from "../../../controllers/user/userPayment/userPaymentController.js";

// const router = express.Router();

// // Generate Braintree client token
// router.get("/client_token", generateClientToken);

// // Process payment
// router.post("/process_payment", processPayment);

// export default router;




// routes/userPaymentRoutes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
  createEventOrder,
  verifyEventPayment
} from "../../../controllers/user/userPayment/userPaymentController.js";
import { getMyRegisteredEvents } from '../../../controllers/admin/eventController.js';
import { protect } from '../../../middlewares/userMiddleware.js';
const router = express.Router();

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify payment
router.post("/verify", verifyPayment);

// Event payment routes
router.post("/create-event-order", createEventOrder);
router.post("/verify-event", verifyEventPayment);

router.get('/my-events', protect, getMyRegisteredEvents);
export default router;