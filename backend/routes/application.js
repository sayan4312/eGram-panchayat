const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getUserApplications,
  getApplicationReceipt
} = require('../controllers/applicationController');
const { protect } = require('../middlewares/auth');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');
const upload = require('../middlewares/upload');

router.use(i18nMiddleware);

router.post('/', protect, upload.array('documents', 10), logAction('Service Application Submitted', 'user'), submitApplication);
router.get('/my', protect, getUserApplications);
router.get('/:id/receipt', protect, getApplicationReceipt);

module.exports = router;
