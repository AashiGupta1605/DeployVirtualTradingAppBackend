import User from "../models/UserModal.js";
import sendEmail from "./emailController.js";
const sendPaymentStatusEmail = async (userId, payment, subscriptionData, status, errorMessage = '') => {
  try {
    const user = await User.findById(userId).select('email');
    if (!user) {
      console.log('User not found for email notification');
      return;
    }

    let emailSubject, emailMessage;

    if (status === 'success') {
      emailSubject = `Payment Confirmation - ${subscriptionData.plan} Subscription`;
      emailMessage = `
        <p>Thank you for subscribing to our <strong>${subscriptionData.plan}</strong> plan!</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Amount: ₹${payment.amount}</li>
          <li>Plan: ${subscriptionData.plan}</li>
          <li>Duration: ${subscriptionData.duration}</li>
          <li>Order ID: ${payment.razorpayOrderId}</li>
          <li>Payment ID: ${payment.razorpayPaymentId}</li>
        </ul>
        <p>Your subscription is now active. You can access all premium features immediately.</p>
      `;
    } else {
      emailSubject = `Payment ${status === 'failed' ? 'Failed' : 'Verification Failed'} - ${subscriptionData?.plan || 'Subscription'}`;
      emailMessage = `
        <p>We encountered an issue with your payment for the <strong>${subscriptionData?.plan || 'Unknown'}</strong> plan.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Amount: ₹${payment?.amount || 'N/A'}</li>
          <li>Plan: ${subscriptionData?.plan || 'Unknown'}</li>
          ${errorMessage ? `<li>Reason: ${errorMessage}</li>` : ''}
        </ul>
        <p>Please try again or contact our support team for assistance.</p>
      `;
    }

    await sendEmail(user.email, emailSubject, emailMessage);
    console.log(`Payment ${status} email sent to ${user.email}`);
  } catch (emailError) {
    console.error(`Failed to send ${status} payment email:`, emailError);
  }
};

export default sendPaymentStatusEmail;

