import Event from '../../models/EventModal.js';
import EventRegistration from '../../models/EventRegistrationModal.js';
import User from '../../models/UserModal.js';
import Payment from '../../models/PaymentModal.js';
import razorpay from '../../helpers/razorPay.js';
import crypto from 'crypto';
import sendEmail from '../../utils/emailController.js';
import { eventSchema } from '../../helpers/adminValidations.js';


export const createEvent = async (req, res) => {
  try {
    console.log('Received event data:', req.body); // Log incoming data
    
    // Validate request
    const { error, value } = eventSchema.validate(req.body, { 
      abortEarly: false,
      convert: true // Ensure type conversion
    });
    
    if (error) {
      console.log('Validation errors:', error.details); // Log validation errors
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }

    // Create event with validated data
    const newEvent = new Event(value);
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
  }
}

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
        message: 'Already registered for this event',
        certificateId: existingRegistration.certificateId // Return existing certificate ID if already registered
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
        registration,
        certificateId: registration.certificateId // Include the certificate ID in response
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
      certificateId: registration.certificateId, // Include the certificate ID in response
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

    // Send confirmation email with certificate ID
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
          <li>Certificate ID: ${registration.certificateId}</li>
        </ul>
        <p>You can now access the event from your dashboard.</p>
        <p>Your certificate ID for this event is: <strong>${registration.certificateId}</strong></p>
      `;

      await sendEmail(user.email, emailSubject, emailMessage);
    }

    res.json({
      success: true,
      message: 'Payment verified and event registration completed',
      payment,
      registration,
      certificateId: registration.certificateId // Include certificate ID in response
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

// Add this new controller to get certificate by registration ID
export const getCertificateByRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await EventRegistration.findById(registrationId)
      .populate('userId', 'name email')
      .populate('eventId', 'title description startDate endDate');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status !== 'Registered') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is only available for completed registrations'
      });
    }

    res.status(200).json({
      success: true,
      certificate: {
        id: registration.certificateId,
        userName: registration.userId.name,
        eventName: registration.eventId.title,
        eventDescription: registration.eventId.description,
        registrationDate: registration.createdAt,
        eventDates: {
          start: registration.eventId.startDate,
          end: registration.eventId.endDate
        }
      }
    });

  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: error.message
    });
  }
};


// real one 

export const getMyRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const registrations = await EventRegistration.find({ 
      userId,
      // status: 'Registered'
      status: { $in: ['Registered', 'Completed'] }
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














export const validateCertificate = async (req, res) => {
  try {
    // Expecting certificateId to be the numeric string, userName as before
    const { certificateId, userName } = req.query;

    // Validate input
    if (!certificateId || !userName) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID (numeric part) and user name are required.",
      });
    }

     // --- Added Validation: Check if certificateId contains only digits ---
     if (!/^\d+$/.test(certificateId)) {
        return res.status(400).json({
          success: false,
          message: 'Certificate ID must be numeric.',
        });
      }
     // --- End Added Validation ---


    // Find the registration using the numeric certificateId stored in the DB
    const registration = await EventRegistration.findOne({
      certificateId: certificateId, // Find by the numeric string directly
      status: 'Completed', // Consider if 'Registered' or other statuses are valid for validation
    })
      .populate("userId", "name") // Populate user details
      .populate("eventId", "title description startDate endDate"); // Populate event details

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "No registration found for the provided certificate ID.",
      });
    }

    // Extract user and event details
    const { userId, eventId } = registration;
    const user = userId; // Populated user details
    const event = eventId; // Populated event details

    // Verify the user name matches exactly (case-insensitive)
    if (user.name.toLowerCase() !== userName.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "User name does not match certificate records.",
      });
    }

    // Optional: Check if event is complete - keep if needed
    const today = new Date();
    const eventEndDate = new Date(event.endDate);
    if (eventEndDate > today) {
      return res.status(400).json({
        success: false,
        message: 'The event is not complete yet. Validation available after the event.',
      });
    }

    // Return the certificate details (note: registration.certificateId is now numeric)
    res.status(200).json({
      success: true,
      certificate: {
        // Prepend "CERT-" here for display consistency if needed,
        // but the raw ID is the numeric string
        id: registration.certificateId, // Send the raw numeric ID
        userName: user.name,
        eventName: event.title,
        eventDescription: event.description,
        registrationDate: registration.createdAt,
        eventDates: {
          start: event.startDate,
          end: event.endDate,
        },
      },
    });
  } catch (error) {
    console.error("Certificate validation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate certificate.",
      error: error.message,
    });
  }
};


// add controllers for shoewing registered events uses in admin side

// Get all event registrations (admin)

export const getAllEventRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find()
      .populate('userId', 'name email gender mobile ')
      .populate('eventId', 'title description startDate endDate entryFee')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations',
      error: error.message
    });
  }
};

// In the controller, update getUserEventsAdmin:
export const getUserEventsAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const registrations = await EventRegistration.find({ userId })
      .populate('eventId', 'title description startDate endDate entryFee participants icon')
      .sort({ createdAt: -1 });

    const events = registrations.map(reg => ({
      ...reg.eventId._doc,
      status: reg.status,
      registrationDate: reg.createdAt,
      paymentStatus: reg.paymentStatus,
      paymentId: reg.paymentId,
      certificateId: reg.certificateId,
      _id: reg._id // include registration ID for status updates
    }));

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user events',
      error: error.message
    });
  }
};

// Update registration status (admin)
export const updateRegistrationStatusAdmin = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    if (!['Registered', 'Pending', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const registration = await EventRegistration.findByIdAndUpdate(
      registrationId,
      { status },
      { new: true }
    ).populate('userId', 'name email')
     .populate('eventId', 'title');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration status updated',
      registration
    });

  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration status',
      error: error.message
    });
  }
};









