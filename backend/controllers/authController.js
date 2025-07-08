const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwt');

const { translate } = require('../utils/i18n');
const logger = require('../utils/logger');
const NotificationService = require('../services/notificationService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, aadhaarNumber, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: translate(req, 'auth.emailAlreadyExists')
      });
    }

    // Create user (set verified: true by default)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      aadhaarNumber,
      address,
      language: req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en',
      verified: true
    });

    res.status(201).json({
      success: true,
      message: translate(req, 'auth.registrationSuccess'),
      data: {
        userId: user._id,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: translate(req, 'auth.invalidCredentials')
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: translate(req, 'auth.invalidCredentials')
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: translate(req, 'auth.accountDeactivated')
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create notification for successful login
    await NotificationService.createSystemNotification(user._id, 'login', req);

    sendTokenResponse(user, 200, res, req);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: translate(req, 'auth.logoutSuccess')
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user language preference
// @route   PUT /api/auth/me/language
// @access  Private
const updateLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;

    const supportedLanguages = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { language },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: translate(req, 'user.languageUpdated'),
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateLanguage
};