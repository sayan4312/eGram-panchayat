const express = require('express');
const router = express.Router();
const { getPublicAnnouncements } = require('../controllers/announcementController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getPublicAnnouncements);

module.exports = router; 