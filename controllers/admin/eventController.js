import Event from '../../models/EventModal.js';
import EventRegistration from '../../models/EventRegistrationModal.js';
import User from '../../models/UserModal.js';
import Payment from '../../models/PaymentModal.js';
import razorpay from '../../helpers/razorPay.js';
import crypto from 'crypto';
import sendEmail from '../../utils/emailController.js';

// Event CRUD Operations
export const createEvent = async (req, res) => {
  try {
    console.log('Received event creation request:', req.body);

    const { 
      title, 
      type, 
      description, 
      startDate, 
      endDate, 
      prize, 
      difficulty,
      rewardTiers
    } = req.body;

    // Validation
    if (!title) return res.status(400).json({ success: false, message: 'Event title is required' });
    if (!['ongoing', 'upcoming', 'completed'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid event type' });
    }
    if (!description) return res.status(400).json({ success: false, message: 'Event description is required' });

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date' });
    if (isNaN(end.getTime())) return res.status(400).json({ success: false, message: 'Invalid end date' });
    if (end < start) return res.status(400).json({ success: false, message: 'End date must be after start date' });

    // Validate reward tiers
    if (rewardTiers && !Array.isArray(rewardTiers)) {
      return res.status(400).json({ success: false, message: 'Reward tiers must be an array' });
    }

    // Create event
    const newEvent = new Event({
      title,
      type,
      description,
      startDate: start,
      endDate: end,
      prize: prize || 'TBD',
      difficulty: difficulty || 'Beginner',
      participants: req.body.participants || 0,
      entryFee: req.body.entryFee || 0,
      cashbackPercentage: req.body.cashbackPercentage || 0,
      rewards: req.body.rewards || [],
      prizeBreakdown: req.body.prizeBreakdown || [],
      rewardTiers: req.body.rewardTiers || [],
      requirements: req.body.requirements || '',
      progress: req.body.progress || 0,
      progressText: req.body.progressText || '',
      icon: req.body.icon || 'Trophy',
      backgroundColor: req.body.backgroundColor || 'bg-gradient-to-br from-blue-50 to-blue-100',
      highlight: req.body.highlight || '',
      isActive: true,
      isDeleted: false
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};


export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      isDeleted: false, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, isDeleted: false }, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or already deleted'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedEvent = await Event.findOneAndUpdate(
      { _id: id, isDeleted: false }, 
      { isDeleted: true, isActive: false }, 
      { new: true }
    );
    
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or already deleted'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event soft deleted successfully',
      event: deletedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};









// card stats for admin

export const totalEvents = async (req, res) => {

  try {
    const count = await Event.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total event count fetched succesffully"  });
<<<<<<< HEAD
  }
}

=======
  }}
>>>>>>> 16fa596799d1e60fbf1fca82768fd58f75ee0501
// Event Registration Operations
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event ID and User ID are required' 
      });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existingRegistration = await EventRegistration.findOne({ 
      userId, 
      eventId,
      status: 'Registered' 
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already registered for this event' 
      });
    }

    // Handle free events
    if (event.entryFee <= 0) {
      const registration = new EventRegistration({
        userId,
        eventId,
        status: 'Registered',
        entryFee: 0
      });

      await registration.save();
      await Event.findByIdAndUpdate(eventId, { $inc: { participants: 1 } });

      return res.status(201).json({
        success: true,
        message: 'Successfully registered for free event',
        registration
      });
    }

    // Paid events
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(event.entryFee * 100),
      currency: 'INR',
      receipt: `event_reg_${eventId}_${userId}_${Date.now()}`,
      notes: {
        eventId: eventId.toString(),
        userId: userId.toString(),
        eventTitle: event.title
      }
    });

    const registration = new EventRegistration({
      userId,
      eventId,
      status: 'Pending',
      entryFee: event.entryFee,
      paymentOrderId: razorpayOrder.id
    });

    await registration.save();

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      registrationId: registration._id,
      message: 'Payment required for event registration'
    });

  } catch (error) {
    console.error('Event Registration Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register for event',
      error: error.message 
    });
  }
};

export const verifyEventPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentId,
      registrationId,
      userId,
      eventId
    } = req.body;

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await Payment.findByIdAndUpdate(paymentId, {
        status: 'Failed',
        paymentDetails: { verificationError: 'Signature mismatch' }
      });

      await EventRegistration.findByIdAndUpdate(registrationId, {
        status: 'Cancelled'
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'Paid',
        updatedAt: new Date()
      },
      { new: true }
    );

    // Update registration
    const registration = await EventRegistration.findByIdAndUpdate(
      registrationId,
      {
        status: 'Registered',
        paymentId: payment._id,
        paymentStatus: 'Completed'
      },
      { new: true }
    );

    // Update event participants
    await Event.findByIdAndUpdate(eventId, { $inc: { participants: 1 } });

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
          <li>Entry Fee: ₹${event.entryFee}</li>
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
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

export const getMyRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const registrations = await EventRegistration.find({ 
      userId,
      status: 'Registered'
    }).populate({
      path: 'eventId',
      match: { isDeleted: false }
    });

    const validRegistrations = registrations.filter(reg => reg.eventId !== null);

    const events = validRegistrations.map(registration => ({
      ...registration.eventId._doc,
      registrationId: registration._id,
      status: registration.status,
      registrationDate: registration.createdAt
    }));

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });

  } 
  catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user events',
      error: error.message
    });
  }
};