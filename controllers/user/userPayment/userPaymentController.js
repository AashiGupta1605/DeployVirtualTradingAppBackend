import Payment from "../../../models/PaymentModal.js";
import SubscriptionPlan from "../../../models/SubscriptionPlanModal.js";
import gateway from "../../../helpers/braintree.js";
// Configure Braintree

// Generate client token
export const generateClientToken = async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});
    res.send(response.clientToken);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Process payment

// Process payment


export const processPayment = async (req, res) => {
    const { userId, paymentMethodNonce, amount, subscriptionData } = req.body;
  
    try {
      // Validate required fields
      if (!paymentMethodNonce || !amount || !subscriptionData) {
        return res.status(400).send("Missing required fields.");
      }
  
      // Create a transaction in Braintree
      const result = await gateway.transaction.sale({
        amount: amount.toString(), // Convert to string (Braintree expects a string)
        paymentMethodNonce: paymentMethodNonce,
          paymentMethodNonce: paymentMethodNonce,
         merchantAccountId: process.env.MERCHANT_ID,
        options: {
          submitForSettlement: true,
        },
      });
  
      if (result.success) {
        // Save payment details in the database
        const payment = new Payment({
          userId,
          paymentMethod: "Braintree",
          amount,
          transactionId: result.transaction.id,
          status: "Completed",
        });
        await payment.save();
  
        // Create subscription plan
        const subscription = new SubscriptionPlan({
          ...subscriptionData,
          userId,
          status: "Active",
        });
        await subscription.save();
  
        res.send("Payment and subscription successful!");
      } else {
        console.error("Braintree Transaction Error:", result.message);
        res.status(500).send("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).send("Internal Server Error");
    }
  };