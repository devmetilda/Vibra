const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events/admin/stats
// @desc    Get admin statistics
// @access  Private (Admin only)
router.get('/admin/stats', [auth, adminAuth], async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'student' });

    // Get total registrations across all events
    const events = await Event.find({ isActive: true });
    const totalRegistrations = events.reduce((sum, event) => sum + event.registeredParticipants.length, 0);

    // Get selected students count (students who have been selected)
    const users = await User.find({ role: 'student' });
    const selectedStudents = users.reduce((sum, user) => {
      const selectedCount = user.registeredEvents.filter(reg => reg.selected === true).length;
      return sum + selectedCount;
    }, 0);

    // Get recent events (last 5 events)
    const recentEvents = await Event.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'fullName');

    res.json({
      totalEvents,
      totalUsers,
      totalRegistrations,
      selectedStudents,
      recentEvents
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/admin/registrations
// @desc    Get all student registrations
// @access  Private (Admin only)
router.get('/admin/registrations', [auth, adminAuth], async (req, res) => {
  try {
    // Get all students who have registered for at least one event
    const studentsWithRegistrations = await User.find({
      role: 'student',
      'registeredEvents.0': { $exists: true }
    }).populate('registeredEvents.event', 'title date category selectionRequired');

    res.json(studentsWithRegistrations);
  } catch (error) {
    console.error('Get student registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events
// @desc    Get all events (with optional filtering)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'fullName email')
      .populate('registeredParticipants.user', 'fullName email')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('registeredParticipants.user', 'fullName email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Admin only)
router.post('/', [auth, adminAuth], [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must not exceed 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must not exceed 1000 characters'),
  body('category')
    .isIn(['academic', 'cultural', 'sports', 'workshop', 'seminar'])
    .withMessage('Invalid category'),
  body('date')
    .notEmpty()
    .withMessage('Date is required'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location is required and must not exceed 200 characters'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      maxParticipants: req.body.maxParticipants || 100
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'fullName email');

    res.status(201).json({
      message: 'Event created successfully',
      event: populatedEvent
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName email');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
router.put('/:id', [auth, adminAuth], [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must not exceed 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must not exceed 1000 characters'),
  body('category')
    .isIn(['academic', 'cultural', 'sports', 'workshop', 'seminar'])
    .withMessage('Invalid category'),
  body('date')
    .notEmpty()
    .withMessage('Date is required'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location is required and must not exceed 200 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, maxParticipants: req.body.maxParticipants || 100 },
      { new: true }
    ).populate('createdBy', 'fullName email');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private (Students only)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    const isRegistered = event.registeredParticipants.some(
      participant => participant.user.toString() === req.user._id.toString()
    );

    if (isRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Add user to event
    event.registeredParticipants.push({ user: req.user._id });
    await event.save();

    // Add event to user's registered events
    await User.findByIdAndUpdate(req.user._id, {
      $push: { registeredEvents: { event: event._id } }
    });

    res.json({ message: 'Successfully registered for event' });

  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id/register
// @desc    Unregister from event
// @access  Private (Students only)
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from event
    event.registeredParticipants = event.registeredParticipants.filter(
      participant => participant.user.toString() !== req.user._id.toString()
    );
    await event.save();

    // Remove event from user's registered events
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { registeredEvents: { event: event._id } }
    });

    res.json({ message: 'Successfully unregistered from event' });

  } catch (error) {
    console.error('Unregister event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/admin/select-student
// @desc    Select a student for an event
// @access  Private (Admin only)
router.post('/admin/select-student', [auth, adminAuth], async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    // Find the user and update their registration status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the specific registration and mark as selected
    const registrationIndex = user.registeredEvents.findIndex(
      reg => reg.event && reg.event.toString() === eventId
    );

    if (registrationIndex === -1) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    user.registeredEvents[registrationIndex].selected = true;
    await user.save();

    res.json({ message: 'Student selected successfully' });

  } catch (error) {
    console.error('Select student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private (Students only)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: 'Event is not active' });
    }

    // Check if event is full
    if (event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.registeredParticipants.some(
      participant => participant.user.toString() === req.user._id.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Add user to event's registered participants
    event.registeredParticipants.push({
      user: req.user._id,
      registeredAt: new Date()
    });

    await event.save();

    // Add event to user's registered events
    const user = await User.findById(req.user._id);
    user.registeredEvents.push({
      event: event._id,
      registeredAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Successfully registered for event',
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        location: event.location
      }
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id/unregister
// @desc    Unregister from an event
// @access  Private (Students only)
router.delete('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from event's registered participants
    event.registeredParticipants = event.registeredParticipants.filter(
      participant => participant.user.toString() !== req.user._id.toString()
    );

    await event.save();

    // Remove event from user's registered events
    const user = await User.findById(req.user._id);
    user.registeredEvents = user.registeredEvents.filter(
      reg => reg.event.toString() !== event._id.toString()
    );

    await user.save();

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Event unregistration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove event from all users' registered events
    await User.updateMany(
      { 'registeredEvents.event': req.params.id },
      { $pull: { registeredEvents: { event: req.params.id } } }
    );

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
