const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'general',
      'revenue',
      'public-works',
      'health',
      'education',
      'welfare',
      'water-supply',
      'sanitation',
      'other'
    ]
  },
  requiredDocuments: [{
    type: String,
    required: true
  }],
  formFields: [{
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'textarea'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String] // For select type fields
  }],
  processingTime: {
    type: String,
    required: [true, 'Processing time is required']
  },
  fee: {
    type: String,
    required: [true, 'Fee information is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  applicationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
serviceSchema.index({ department: 1, isActive: 1 });
serviceSchema.index({ category: 1, isActive: 1 });

// Update application count when referenced
serviceSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);