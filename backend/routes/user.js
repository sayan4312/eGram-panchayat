const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserApplications, getUserNotifications } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');
const serviceController = require('../controllers/serviceController');
const applicationController = require('../controllers/applicationController');
const upload = require('../middlewares/upload');

router.use(i18nMiddleware);

// @route   GET /api/user/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, getUserProfile);

// @route   PUT /api/user/me
// @desc    Update user profile
// @access  Private
router.put('/me', protect, logAction('User Profile Updated', 'user'), updateUserProfile);

// GET /api/user/applications
router.get('/applications', protect, getUserApplications);

// POST /api/user/applications
router.post('/applications', protect, upload.array('documents'), applicationController.submitApplication);

// GET /api/user/notifications
router.get('/notifications', protect, getUserNotifications);

// GET /api/services
router.get('/services', serviceController.getAllServices);

module.exports = router;
