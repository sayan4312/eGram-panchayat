const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateLanguage
} = require('../controllers/authController');
const staffController = require('../controllers/staffController');
const { protect } = require('../middlewares/auth');
const { validateRegistration, validateLogin } = require('../middlewares/validation');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');

// Apply i18n middleware to all routes
router.use(i18nMiddleware);

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegistration, logAction('User Registration', 'user'), register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logAction('User Logout', 'user'), logout);



// @route   POST /api/auth/change-password
// @desc    Change user password (mustChangePassword flow)
// @access  Private
router.post('/change-password', protect, staffController.changePassword);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/me/language
// @desc    Update user language preference
// @access  Private
router.put('/me/language', protect, logAction('Language Updated', 'user'), updateLanguage);

module.exports = router;