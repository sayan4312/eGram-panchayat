const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  trackingId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-review', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  uploadedDocuments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String,
    size: Number,
    format: String,
    status: {
      type: String,
      enum: ['pending', 'verified', 'invalid'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationComment: String,
    verifiedAt: Date,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: String
  }],
  internalComments: [{
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  rejectionReason: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  completedAt: Date,
  certificate: {
    url: String,
    publicId: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ serviceId: 1, status: 1 });
applicationSchema.index({ trackingId: 1 });
applicationSchema.index({ assignedTo: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Add indexes for better query performance
applicationSchema.index({ userId: 1 });
applicationSchema.index({ serviceId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ serviceId: 1, status: 1 });

// Generate tracking ID
applicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.trackingId) {
    try {
    const service = await mongoose.model('Service').findById(this.serviceId);
      if (!service) {
        console.error('Service not found for ID:', this.serviceId);
        // Generate fallback tracking ID
        this.trackingId = `GP${new Date().getFullYear()}${Date.now()}`;
        return next();
      }
      
    const count = await this.constructor.countDocuments({ serviceId: this.serviceId });
    
    // Generate tracking ID based on service category and count
    const categoryCode = {
        'general': 'GN',
        'revenue': 'RV', 
        'public-works': 'PW',
        'health': 'HL',
        'education': 'ED',
        'welfare': 'WL',
        'water-supply': 'WS',
        'sanitation': 'SN',
        'other': 'OT'
    };
    
    const code = categoryCode[service.category] || 'GP';
    const year = new Date().getFullYear();
    const sequence = String(count + 1).padStart(4, '0');
    
    this.trackingId = `${code}${year}${sequence}`;
      console.log('Generated tracking ID:', this.trackingId, 'for service:', service.title);
    } catch (error) {
      console.error('Error generating tracking ID:', error);
      // Fallback tracking ID
      this.trackingId = `GP${new Date().getFullYear()}${Date.now()}`;
    }
  }
  next();
});

// Add timeline entry
applicationSchema.methods.addTimelineEntry = function(status, actor, comment = '') {
  this.timeline.push({
    status,
    actor,
    comment,
    date: new Date()
  });
  return this.save();
};

// Add internal comment
applicationSchema.methods.addInternalComment = function(by, message) {
  this.internalComments.push({
    by,
    message,
    date: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);