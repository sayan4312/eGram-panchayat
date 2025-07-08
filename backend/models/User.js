const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[+]?[\d\s\-()]{10,}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'staff', 'admin'],
    default: 'user'
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
    ],
    required: function() {
      return this.role === 'staff';
    }
  },
  position: {
    type: String,
    enum: [
      'Senior Officer',
      'Officer',
      'Assistant Officer',
      'Junior Assistant'
    ],
    required: function() {
      return this.role === 'staff';
    }
  },
  subRoles: [{
    type: String,
    enum: [
      'document_verifier',
      'grievance_handler', 
      'application_processor',
      'notification_manager'
    ]
  }],
  language: {
    type: String,
    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu'],
    default: 'en'
  },
  verified: {
    type: Boolean,
    default: false
  },

  address: {
    street: String,
    village: String,
    district: String,
    state: String,
    pincode: String
  },
  aadhaarNumber: {
    type: String,
    match: [/^\d{12}$/, 'Aadhaar number must be 12 digits']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profileImage: {
    url: String,
    publicId: String
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1 });
userSchema.index({ department: 1 });
userSchema.index({ createdAt: -1 });
// Removed text search index to avoid MongoDB Atlas language override issues

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model('User', userSchema);