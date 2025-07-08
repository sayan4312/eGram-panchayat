const Notification = require('../models/Notification');
const User = require('../models/User');
const { translate } = require('../utils/i18n');

class NotificationService {
  // Create notification for application submission
  static async createApplicationNotification(userId, applicationData, req) {
    try {
      const notification = await Notification.create({
        userId,
        title: translate(req, 'notification.application.submitted.title'),
        message: translate(req, 'notification.application.submitted.message', {
          trackingId: applicationData.trackingId,
          serviceName: applicationData.serviceName
        }),
        type: 'application',
        priority: 'normal',
        isRead: false,
        metadata: {
          applicationId: applicationData._id,
          trackingId: applicationData.trackingId,
          serviceId: applicationData.serviceId
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating application notification:', error);
    }
  }

  // Create notification for application status update
  static async createStatusUpdateNotification(userId, applicationData, newStatus, req) {
    try {
      const statusMessages = {
        'in-review': 'notification.application.inReview',
        'approved': 'notification.application.approved',
        'rejected': 'notification.application.rejected',
        'completed': 'notification.application.completed'
      };

      const notification = await Notification.create({
        userId,
        title: translate(req, 'notification.application.statusUpdate.title'),
        message: translate(req, statusMessages[newStatus] || 'notification.application.statusUpdate.default', {
          trackingId: applicationData.trackingId,
          serviceName: applicationData.serviceName,
          status: newStatus
        }),
        type: 'application',
        priority: newStatus === 'rejected' ? 'high' : 'normal',
        isRead: false,
        metadata: {
          applicationId: applicationData._id,
          trackingId: applicationData.trackingId,
          serviceId: applicationData.serviceId,
          status: newStatus
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating status update notification:', error);
    }
  }



  // Create notification for document verification
  static async createDocumentVerificationNotification(userId, applicationData, documentName, status, req) {
    try {
      const notification = await Notification.create({
        userId,
        title: translate(req, 'notification.document.verification.title'),
        message: translate(req, 'notification.document.verification.message', {
          documentName,
          status,
          trackingId: applicationData.trackingId
        }),
        type: 'document',
        priority: status === 'invalid' ? 'high' : 'normal',
        isRead: false,
        metadata: {
          applicationId: applicationData._id,
          trackingId: applicationData.trackingId,
          documentName,
          status
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating document verification notification:', error);
    }
  }

  // Create notification for staff assignment
  static async createStaffAssignmentNotification(userId, applicationData, staffName, req) {
    try {
      const notification = await Notification.create({
        userId,
        title: translate(req, 'notification.application.assigned.title'),
        message: translate(req, 'notification.application.assigned.message', {
          trackingId: applicationData.trackingId,
          staffName
        }),
        type: 'application',
        priority: 'normal',
        isRead: false,
        metadata: {
          applicationId: applicationData._id,
          trackingId: applicationData.trackingId,
          staffId: applicationData.assignedTo
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating staff assignment notification:', error);
    }
  }

  // Create notification for new announcement
  static async createAnnouncementNotification(announcementData, targetAudience, req) {
    try {
      let users = [];
      
      if (targetAudience === 'all') {
        users = await User.find({ isActive: true });
      } else if (targetAudience === 'users') {
        users = await User.find({ role: 'user', isActive: true });
      } else if (targetAudience === 'staff') {
        users = await User.find({ role: 'staff', isActive: true });
      } else if (targetAudience === 'admin') {
        users = await User.find({ role: 'admin', isActive: true });
      }

      const notifications = users.map(user => ({
        userId: user._id,
        title: translate(req, 'notification.announcement.title'),
        message: translate(req, 'notification.announcement.message', {
          title: announcementData.title
        }),
        type: 'announcement',
        priority: 'normal',
        isRead: false,
        metadata: {
          announcementId: announcementData._id,
          title: announcementData.title
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error('Error creating announcement notifications:', error);
    }
  }

  // Create notification for system events (login, password change, etc.)
  static async createSystemNotification(userId, eventType, req) {
    try {
      const eventMessages = {
        'login': 'notification.system.login',
        'password_change': 'notification.system.passwordChange',
        'profile_update': 'notification.system.profileUpdate',
        'account_activated': 'notification.system.accountActivated',
        'account_deactivated': 'notification.system.accountDeactivated'
      };

      const notification = await Notification.create({
        userId,
        title: translate(req, 'notification.system.title'),
        message: translate(req, eventMessages[eventType] || 'notification.system.default'),
        type: 'system',
        priority: 'low',
        isRead: false,
        metadata: {
          eventType
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating system notification:', error);
    }
  }

  // Create notification for admin actions
  static async createAdminActionNotification(userId, actionType, details, req) {
    try {
      const actionMessages = {
        'staff_created': 'notification.admin.staffCreated',
        'staff_updated': 'notification.admin.staffUpdated',
        'staff_deleted': 'notification.admin.staffDeleted',
        'service_created': 'notification.admin.serviceCreated',
        'service_updated': 'notification.admin.serviceUpdated',
        'service_deleted': 'notification.admin.serviceDeleted'
      };

      const notification = await Notification.create({
        userId,
        title: translate(req, 'notification.admin.title'),
        message: translate(req, actionMessages[actionType] || 'notification.admin.default', details),
        type: 'admin',
        priority: 'normal',
        isRead: false,
        metadata: {
          actionType,
          details
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating admin action notification:', error);
    }
  }
}

module.exports = NotificationService; 