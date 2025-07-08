const express = require('express');
const router = express.Router();
const {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

const { protect } = require('../middlewares/auth');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');

router.use(i18nMiddleware);

// 📥 Get logged-in user's notifications
router.get('/', protect, getUserNotifications);

// ✅ Mark one as read
router.put('/:id/read', protect, logAction('Notification Read', 'notification'), markAsRead);

// ✅ Mark all as read
router.put('/read-all', protect, logAction('All Notifications Read', 'notification'), markAllAsRead);

// ✅ Admin or staff: send notification
router.post('/', protect, logAction('Notification Sent', 'notification'), sendNotification);

module.exports = router;
