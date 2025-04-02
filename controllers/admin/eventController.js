import Event from '../../models/EventModal.js';

// In your backend event controller
export const createEvent = async (req, res) => {
  try {
    // Log incoming request body for debugging
    console.log('Received event creation request:', req.body);

    // Validate required fields
    const { 
      title, 
      type, 
      description, 
      startDate, 
      endDate, 
      prize, 
      difficulty 
    } = req.body;

    // Comprehensive validation
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event title is required' 
      });
    }

    if (!['ongoing', 'upcoming', 'completed'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event type' 
      });
    }

    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event description is required' 
      });
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid start date' 
      });
    }

    if (isNaN(end.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid end date' 
      });
    }

    if (end < start) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }

    // Create the event
    const newEvent = new Event({
      title,
      type,
      description,
      startDate: start,
      endDate: end,
      prize: prize || 'TBD',
      difficulty: difficulty || 'Beginner',
      // Ensure default values match schema
      participants: req.body.participants || 0,
      entryFee: req.body.entryFee || 0,
      cashbackPercentage: req.body.cashbackPercentage || 0,
      rewards: req.body.rewards || [],
      prizeBreakdown: req.body.prizeBreakdown || [],
      requirements: req.body.requirements || '',
      progress: req.body.progress || 0,
      progressText: req.body.progressText || '',
      icon: req.body.icon || 'Trophy',
      backgroundColor: req.body.backgroundColor || 'bg-gradient-to-br from-blue-50 to-blue-100',
      highlight: req.body.highlight || '',
      isActive: true,
      isDeleted: false
    });

    // Save the event
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
    // Fetch events that are not deleted and active
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
    
    // Find and update the event, ensuring it's not deleted
    const updatedEvent = await Event.findOneAndUpdate(
      { 
        _id: id, 
        isDeleted: false 
      }, 
      updateData, 
      { 
        new: true,
        runValidators: true 
      }
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
    
    // Soft delete: update isDeleted to true
    const deletedEvent = await Event.findOneAndUpdate(
      { 
        _id: id, 
        isDeleted: false 
      }, 
      { 
        isDeleted: true,
        isActive: false
      }, 
      { 
        new: true 
      }
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
};