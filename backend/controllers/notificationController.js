const Notification = require('../models/Notification');
const User = require('../models/User');
const { translate } = require('../utils/i18n');

// @desc Send notification to user(s)
// @route POST /api/notifications
// @access Admin or Staff
const sendNotification = async (req, res, next) => {
  try {
    const {
      title,
      message,
      type,
      priority = 'medium',
      targetAudience = 'all',
      department,
      scheduledFor,
      expiresAt,
      relatedEntity,
      actionUrl,
      actionText
    } = req.body;

    const io = req.app.get('io');
    let targetUsers = [];

    if (targetAudience === 'all') {
      targetUsers = await User.find({ isActive: true }, '_id');
    } else if (targetAudience === 'users') {
      targetUsers = await User.find({ role: 'user', isActive: true }, '_id');
    } else if (targetAudience === 'staff') {
      targetUsers = await User.find({ role: 'staff', isActive: true }, '_id');
    } else if (targetAudience === 'admin') {
      targetUsers = await User.find({ role: 'admin', isActive: true }, '_id');
    } else if (targetAudience === 'department' && department) {
      targetUsers = await User.find({ role: 'staff', department, isActive: true }, '_id');
    }

    const userIds = targetUsers.map(u => u._id);

    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type,
      priority,
      targetAudience,
      department,
      scheduledFor,
      expiresAt,
      relatedEntity,
      actionUrl,
      actionText,
      createdBy: req.user._id
    }));

    const saved = await Notification.insertMany(notifications);

    userIds.forEach((userId, idx) => {
      io.to(userId.toString()).emit('notification', saved[idx]);
    });

    res.status(201).json({
      success: true,
      message: translate(req, 'notification.sent'),
      count: saved.length,
      data: saved
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get user's notifications
// @route GET /api/notifications
// @access Private
const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'notification.notFound')
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // Emit updated notification to the user
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('notification', notification);

    res.status(200).json({
      success: true,
      message: translate(req, 'notification.markedAsRead')
    });
  } catch (err) {
    next(err);
  }
};

// @desc Mark all notifications as read
// @route PUT /api/notifications/read-all
// @access Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: translate(req, 'notification.allRead')
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
