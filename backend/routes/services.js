const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/auth');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');
const serviceController = require('../controllers/serviceController');

router.use(i18nMiddleware);

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get('/', serviceController.getAllServices);

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', serviceController.getServiceById);

// @route   GET /api/services/category/:category
// @desc    Get services by category
// @access  Public
router.get('/category/:category', serviceController.getServicesByCategory);

// @route   POST /api/services
// @desc    Create a new service
// @access  Private/Admin
router.post('/', protect, isAdmin, serviceController.createService);

module.exports = router; 