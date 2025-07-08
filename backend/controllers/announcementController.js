const Announcement = require('../models/Announcement');
const NotificationService = require('../services/notificationService');

exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ data: announcements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    // Validate required fields
    const { title, message, targetAudience, startDate, endDate } = req.body;
    if (!title || !message || !targetAudience || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'message', 'targetAudience', 'startDate', 'endDate'],
        received: Object.keys(req.body)
      });
    }
    const announcement = new Announcement(req.body);
    const savedAnnouncement = await announcement.save();
    
    // Create notifications for all target users
    await NotificationService.createAnnouncementNotification(savedAnnouncement, req.body.targetAudience, req);
    
    res.status(201).json({ data: savedAnnouncement });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: err.message });
    }
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json({ data: announcement });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: err.message });
    }
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByIdAndDelete(id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json({ data: announcement });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
};

exports.getPublicAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const userRole = req.user?.role;
    const userDepartment = req.user?.department;
    // Build query based on user role
    let targetAudienceQuery = [];
    switch (userRole) {
      case 'admin':
        targetAudienceQuery = [
          { targetAudience: 'all' },
          { targetAudience: 'users' },
          { targetAudience: 'staff' },
          { targetAudience: 'admin' },
          { targetAudience: 'department' }
        ];
        break;
      case 'staff':
        targetAudienceQuery = [
          { targetAudience: 'all' },
          { targetAudience: 'staff' },
          { targetAudience: 'department' }
        ];
        break;
      case 'user':
        targetAudienceQuery = [
          { targetAudience: 'all' },
          { targetAudience: 'users' }
        ];
        break;
      default:
        targetAudienceQuery = [
          { targetAudience: 'all' }
        ];
    }
    const query = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: targetAudienceQuery
    };
    if (userDepartment && targetAudienceQuery.some(q => q.targetAudience === 'department')) {
      query.$or = query.$or.map(condition => {
        if (condition.targetAudience === 'department') {
          return { targetAudience: 'department', department: userDepartment };
        }
        return condition;
      });
    }
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json({ data: announcements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}; 