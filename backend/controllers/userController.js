const User = require('../models/User');
const { translate } = require('../utils/i18n');
const logger = require('../utils/logger');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const service = require('../models/Service');
const mongoose = require('mongoose');

// @desc    Get logged-in user profile
// @route   GET /api/user/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'user.notFound')
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/user/me
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'user.notFound')
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: translate(req, 'user.profileUpdated'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote user to staff/admin
// @route   PUT /api/admin/users/:id/promote
// @access  Private/Admin
const promoteUser = async (req, res, next) => {
  try {
    const { role } = req.body;

    const validRoles = ['user', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: translate(req, 'user.invalidRole')
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'user.notFound')
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: translate(req, 'user.roleUpdated'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign sub-roles and department to staff
// @route   PUT /api/admin/users/:id/assign-subroles
// @access  Private/Admin
const assignSubRoles = async (req, res, next) => {
  try {
    const { department, subRoles } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'staff') {
      return res.status(400).json({
        success: false,
        message: translate(req, 'user.invalidStaffUser')
      });
    }

    user.department = department || user.department;
    user.subRoles = Array.isArray(subRoles) ? subRoles : [];
    await user.save();

    res.status(200).json({
      success: true,
      message: translate(req, 'user.subRolesUpdated'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get applications for the logged-in user
const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: new mongoose.Types.ObjectId(req.user._id) })
      .populate('serviceId');
   
    const appsWithService = applications.map(app => ({
      ...app.toObject(),
      service: app.serviceId,
    }));
    res.json({ success: true, data: appsWithService });
  } catch (error) {
    next(error);
  }
};

// Get notifications for the logged-in user
const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id });
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  promoteUser,
  assignSubRoles,
  getUserApplications,
  getUserNotifications
};
