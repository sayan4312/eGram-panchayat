const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['system', 'application', 'grievance', 'announcement', 'reminder', 'document', 'admin'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'normal'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'users', 'staff', 'admin', 'department'],
    default: 'all'
  },
  department: {
    type: String,
    enum: [
      'General Administration',
      'Revenue',
      'Public Works',
      'Health',
      'Education',
      'Welfare',
      'Water Supply',
      'Sanitation',
      'Other'
    ]
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['application', 'grievance', 'service', 'user']
    },
    entityId: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  scheduledFor: Date,
  expiresAt: Date,
  actionUrl: String,
  actionText: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ targetAudience: 1, department: 1 });
notificationSchema.index({ type: 1, scheduledFor: 1 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);