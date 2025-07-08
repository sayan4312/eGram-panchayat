const express = require('express');
const router = express.Router();
const {
  getAllUsers, promoteUser, assignSubRoles
} = require('../controllers/userController');
const { getAllApplications } = require('../controllers/applicationController');
// Placeholder controller imports for new admin features
const staffController = require('../controllers/staffController');
const serviceController = require('../controllers/serviceController');
const announcementController = require('../controllers/announcementController');
const logController = require('../controllers/logController');
const dashboardController = require('../controllers/dashboardController');
const { protect, isAdmin } = require('../middlewares/auth');
const { logAction } = require('../middlewares/logger');
const { i18nMiddleware } = require('../utils/i18n');
const { cacheMiddleware } = require('../middlewares/cache');

router.use(i18nMiddleware);

// Apply admin protection to all routes
router.use(protect, isAdmin);

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   PUT /api/admin/users/:id/promote
router.put('/users/:id/promote', logAction('User Promoted', 'admin'), promoteUser);

// @route   PUT /api/admin/users/:id/assign-subroles
router.put('/users/:id/assign-subroles', logAction('SubRoles Assigned', 'admin'), assignSubRoles);

// @route   GET /api/admin/applications
router.get('/applications', getAllApplications);



// @route   GET/POST/PUT/DELETE /api/admin/staff
router.get('/staff', staffController.getAllStaff);
router.post('/staff', staffController.createStaff);
router.put('/staff/:id', staffController.updateStaff);
router.delete('/staff/:id', staffController.deleteStaff);

// @route   GET/POST/PUT/DELETE /api/admin/services
router.get('/services', serviceController.getAllServices);
router.post('/services', protect, isAdmin, serviceController.createService);
router.put('/services/:id', serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);

// @route   GET/POST/PUT/DELETE /api/admin/announcements
router.get('/announcements', announcementController.getAllAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);
router.put('/announcements/:id', announcementController.updateAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);
router.get('/announcements/:id', announcementController.getAnnouncementById);

// @route   GET /api/admin/logs
router.get('/logs', logController.getAdminLogs);

// @route   GET /api/admin/stats (with 2-minute cache)
router.get('/stats', cacheMiddleware(120000), dashboardController.getStats);

// @route   GET /api/admin/charts (with 5-minute cache)
router.get('/charts', cacheMiddleware(300000), dashboardController.getCharts);

// @route   GET /api/admin/recent-activity (with 1-minute cache)
router.get('/recent-activity', cacheMiddleware(60000), dashboardController.getRecentActivity);

module.exports = router;
