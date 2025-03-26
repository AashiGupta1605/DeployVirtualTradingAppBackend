import express from "express";
import {
  generateClientToken,
  processPayment,
} from "../../../controllers/user/userPayment/userPaymentController.js";

const router = express.Router();

// Generate Braintree client token
router.get("/client_token", generateClientToken);

// Process payment
router.post("/process_payment", processPayment);

export default router;