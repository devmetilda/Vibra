const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('registeredEvents.event', 'title date location category');

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, profileImage, department, year, studentId, phoneNumber, role, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (fullName) user.fullName = fullName;
    if (profileImage) user.profileImage = profileImage;
    if (department) user.department = department;
    if (year) user.year = year;
    if (studentId) user.studentId = studentId;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (role) user.role = role;

    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/registered-events
// @desc    Get user's registered events
// @access  Private
router.get('/registered-events', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'registeredEvents.event',
        populate: {
          path: 'createdBy',
          select: 'fullName email'
        }
      });

    const registeredEvents = user.registeredEvents
      .filter(reg => reg.event) // Filter out null events
      .map(reg => ({
        ...reg.event.toObject(),
        registeredAt: reg.registeredAt
      }));

    res.json(registeredEvents);
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    // For now, create sample notifications based on user's registered events
    const user = await User.findById(req.user._id)
      .populate('registeredEvents.event', 'title date');

    const notifications = [];

    // Add welcome notification
    notifications.push({
      id: 1,
      message: 'Welcome to the Event Management System!',
      time: '1 day ago',
      read: true,
      type: 'welcome'
    });

    // Add notifications for upcoming events
    user.registeredEvents.forEach((reg, index) => {
      if (reg.event && new Date(reg.event.date) > new Date()) {
        notifications.push({
          id: index + 2,
          message: `Reminder: "${reg.event.title}" is coming up on ${new Date(reg.event.date).toLocaleDateString()}`,
          time: '2 hours ago',
          read: false,
          type: 'reminder'
        });
      }
    });

    // Add registration confirmations
    user.registeredEvents.slice(0, 2).forEach((reg, index) => {
      if (reg.event) {
        notifications.push({
          id: index + 10,
          message: `Your registration for "${reg.event.title}" has been confirmed`,
          time: '3 days ago',
          read: true,
          type: 'confirmation'
        });
      }
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    // For now, just return success since notifications are generated dynamically
    // In a real app, you'd update the notification in the database
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get dashboard statistics for user
// @access  Private
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('registeredEvents.event');

    const totalRegistered = user.registeredEvents.length;
    const upcomingEvents = user.registeredEvents.filter(reg => 
      reg.event && new Date(reg.event.date) > new Date()
    ).length;

    let stats = {
      totalRegistered,
      upcomingEvents,
      completedEvents: totalRegistered - upcomingEvents
    };

    // Additional stats for admin
    if (req.user.role === 'admin') {
      const totalEvents = await Event.countDocuments({ isActive: true });
      const totalUsers = await User.countDocuments({ role: 'student' });
      const eventsCreated = await Event.countDocuments({ createdBy: req.user._id });

      stats = {
        ...stats,
        totalEvents,
        totalUsers,
        eventsCreated
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users (Admin only)
// @desc    Get all users
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('registeredEvents.event', 'title date')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/role (Admin only)
// @desc    Update user role
// @access  Private (Admin)
router.put('/:id/role', [auth, adminAuth], async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user details (Admin only)
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { fullName, email, department, phoneNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        email,
        department,
        phoneNumber
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id/registrations
// @desc    Remove user from all event registrations
// @access  Private (Admin only)
router.delete('/:id/registrations', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user from all events they're registered for
    const userEvents = user.registeredEvents.map(reg => reg.event);
    await Event.updateMany(
      { _id: { $in: userEvents } },
      { $pull: { registeredParticipants: req.params.id } }
    );

    // Clear user's registered events
    user.registeredEvents = [];
    await user.save();

    res.json({ message: 'User removed from all events successfully' });
  } catch (error) {
    console.error('Remove user registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
