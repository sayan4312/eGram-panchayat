const Service = require('../models/Service');
const Application = require('../models/Application');
const NotificationService = require('../services/notificationService');

exports.getAllServices = async (req, res) => {
  try {
    // Use aggregation pipeline to get services with application counts in a single query
    const servicesWithCounts = await Service.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'serviceId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationCount: { $size: '$applications' },
          status: { $cond: ['$isActive', 'active', 'inactive'] }
        }
      },
      {
        $project: {
          applications: 0 // Remove the applications array from response
        }
      }
    ]);
    
    res.json({ data: servicesWithCounts });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ data: service });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

exports.getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.find({ 
      category: req.params.category,
      isActive: true 
    });
    res.json({ data: services });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services by category' });
  }
};

exports.createService = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: 'User authentication required to create a service.' });
    }
    const serviceData = {
      ...req.body,
      createdBy: req.user._id
    };
    const service = new Service(serviceData);
    await service.save();
    
    // Create notification for admin about service creation
    await NotificationService.createAdminActionNotification(req.user._id, 'service_created', { name: service.title }, req);
    
    res.status(201).json({ data: service });
  } catch (err) {
    console.error('Service creation error:', err);
    if (err.errors) {
      console.error('Validation errors:', err.errors);
    }
    res.status(500).json({ error: 'Failed to create service' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    // Create notification for admin about service update
    if (service) {
      await NotificationService.createAdminActionNotification(req.user._id, 'service_updated', { name: service.title }, req);
    }
    
    res.json({ data: service });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await Service.findByIdAndDelete(req.params.id);
      // Create notification for admin about service deletion
      await NotificationService.createAdminActionNotification(req.user._id, 'service_deleted', { name: service.title }, req);
    }
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
