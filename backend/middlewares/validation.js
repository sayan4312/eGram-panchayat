const { body, validationResult } = require('express-validator');
const { translate } = require('../utils/i18n');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: translate(req, 'validation.failed'),
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[+]?[\d\s\-()]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('aadhaarNumber')
    .optional()
    .matches(/^\d{12}$/)
    .withMessage('Aadhaar number must be 12 digits'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];



// Service creation validation
const validateService = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('department')
    .isIn([
      'Housing & Welfare',
      'Water & Sanitation',
      'Agriculture',
      'Infrastructure',
      'Women & Child Welfare',
      'Public Documentation'
    ])
    .withMessage('Invalid department'),
  body('category')
    .isIn(['housing', 'water', 'agriculture', 'infrastructure', 'welfare', 'certificates'])
    .withMessage('Invalid category'),
  body('requiredDocuments')
    .isArray({ min: 1 })
    .withMessage('At least one required document must be specified'),
  body('processingTime')
    .trim()
    .notEmpty()
    .withMessage('Processing time is required'),
  body('fee')
    .trim()
    .notEmpty()
    .withMessage('Fee information is required'),
  handleValidationErrors
];

// Application validation
const validateApplication = [
  body('serviceId')
    .isMongoId()
    .withMessage('Invalid service ID'),
  body('formData')
    .isObject()
    .withMessage('Form data is required'),
  handleValidationErrors
];



// Notification validation
const validateNotification = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('type')
    .isIn(['system', 'application', 'grievance', 'announcement', 'reminder'])
    .withMessage('Invalid notification type'),
  body('targetAudience')
    .isIn(['all', 'users', 'staff', 'admin', 'department'])
    .withMessage('Invalid target audience'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateService,
  validateApplication,
  validateNotification,
  handleValidationErrors
};