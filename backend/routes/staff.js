const express = require('express');
const router = express.Router();
const {
  getDepartmentApplications,
  updateApplicationStatus,
  verifyDocuments,
  addApplicationComment,
  updateDocumentStatus
} = require('../controllers/applicationController');

const { protect, isStaff } = require('../middlewares/auth');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');
const staffController = require('../controllers/staffController');

router.get('/positions', staffController.getStaffPositions);

router.use(i18nMiddleware);
router.use(protect, isStaff);

// Applications
router.get('/applications', getDepartmentApplications);
router.put('/applications/:id/status', logAction('Application Status Updated', 'staff'), updateApplicationStatus);
router.put('/applications/:id/verify-documents', logAction('Documents Verified', 'staff'), verifyDocuments);
router.post('/applications/:id/comment', logAction('Internal Comment Added', 'staff'), addApplicationComment);
router.put('/applications/:appId/documents/:docName', updateDocumentStatus);



module.exports = router;
