const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');
const uploadController = require('../controllers/uploadController');
const upload = require('../middlewares/upload');

router.use(i18nMiddleware);

// @route   POST /api/upload/documents
// @desc    Upload documents for an application
// @access  Private
router.post('/documents', protect, upload.array('documents', 10), logAction('Documents Uploaded', 'user'), uploadController.uploadDocuments);

// @route   GET /api/upload/documents/:applicationId
// @desc    Get documents for an application
// @access  Private
router.get('/documents/:applicationId', protect, uploadController.getApplicationDocuments);

// @route   DELETE /api/upload/documents/:documentId
// @desc    Delete a document
// @access  Private
router.delete('/documents/:documentId', protect, logAction('Document Deleted', 'user'), uploadController.deleteDocument);

// @route   GET /api/upload/user-documents
// @desc    Get all uploaded documents for the logged-in user (with service info)
// @access  Private
router.get('/user-documents', protect, uploadController.getUserDocuments);

module.exports = router; 