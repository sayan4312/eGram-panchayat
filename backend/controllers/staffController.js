const User = require('../models/User');
const NotificationService = require('../services/notificationService');

exports.getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', role = '' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query filters
    const staffRoles = ['staff', 'Senior Officer', 'Officer', 'Assistant Officer', 'Junior Assistant'];
    const filters = { role: { $in: staffRoles } };
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) filters.department = department;
    if (role) filters.role = role;
    
    // Get total count for pagination
    const total = await User.countDocuments(filters);
    
    // Get staff with pagination and field selection
    const staff = await User.find(filters)
      .select('name email phone department role position isActive lastLogin performance applicationsHandled')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({ 
      data: staff,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: skip + staff.length < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

exports.createStaff = async (req, res) => {
  try {
    console.log('Create staff payload:', req.body);
    const { name, email, phone, department, role, isActive } = req.body;
    const staff = new User({
      name,
      email,
      phone,
      department,
      role: 'staff',
      isActive,
      password: 'password123', // or generate a random password
      mustChangePassword: true
    });
    await staff.save();
    
    // Create notification for admin about staff creation
    await NotificationService.createAdminActionNotification(req.user._id, 'staff_created', { name: staff.name }, req);
    
    res.status(201).json({ data: staff });
  } catch (err) {
    console.error('Create staff error:', err);
    if (err.errors) {
      console.error('Validation errors:', err.errors);
    }
    res.status(500).json({ error: err.message || 'Failed to create staff' });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    // Create notification for admin about staff update
    if (staff) {
      await NotificationService.createAdminActionNotification(req.user._id, 'staff_updated', { name: staff.name }, req);
    }
    
    res.json({ data: staff });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff' });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (staff) {
      await User.findByIdAndDelete(req.params.id);
      // Create notification for admin about staff deletion
      await NotificationService.createAdminActionNotification(req.user._id, 'staff_deleted', { name: staff.name }, req);
    }
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff' });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user._id; // assuming user is authenticated
  const { newPassword } = req.body;
  const user = await User.findById(userId);
  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
}; 

exports.getStaffPositions = (req, res) => {
  res.json([
    'Senior Officer',
    'Officer',
    'Assistant Officer',
    'Junior Assistant'
  ]);
}; 