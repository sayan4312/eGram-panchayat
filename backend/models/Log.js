const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    maxlength: [200, 'Action cannot exceed 200 characters']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'staff', 'admin'],
    required: true
  },
  department: String,
  entityType: {
    type: String,
    enum: ["user", "application", "service", "grievance", "notification", "system", "staff"], // add "staff"
    required: true
  },
  entityId: mongoose.Schema.Types.ObjectId,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  }
}, {
  timestamps: true
});

// Index for better query performance
logSchema.index({ performedBy: 1, createdAt: -1 });
logSchema.index({ role: 1, action: 1 });
logSchema.index({ entityType: 1, entityId: 1 });
logSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);