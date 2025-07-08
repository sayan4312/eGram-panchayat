const Application = require('../models/Application');
const Service = require('../models/Service');
const { translate } = require('../utils/i18n');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../config/cloudinary');
const NotificationService = require('../services/notificationService');

// @desc    Submit a new service application
// @route   POST /api/applications
// @access  Private/User
const submitApplication = async (req, res, next) => {
  try {
    // If multipart/form-data, application data is in req.body.application (JSON string)
    let applicationData;
    if (req.body.application) {
      try {
        applicationData = JSON.parse(req.body.application);
      } catch (parseError) {
        console.error('Error parsing application data:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid application data format'
        });
      }
    } else {
      applicationData = req.body;
    }
    
    const { serviceId, formData, trackingId } = applicationData;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'application.serviceNotFound')
      });
    }

    // Handle uploaded files with Cloudinary
    let uploadedDocuments = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'files for upload');
      for (const file of req.files) {
        try {
          console.log('Uploading file:', file.originalname, 'Size:', file.size);
          const cloudResult = await uploadToCloudinary({
            buffer: file.buffer,
            originalname: file.originalname
          }, 'applications');
          
          const documentData = {
            name: file.originalname,
            url: cloudResult.url,
            publicId: cloudResult.publicId,
            size: file.size,
            format: cloudResult.format,
            uploadedAt: new Date()
          };
          
          uploadedDocuments.push(documentData);
          console.log('File uploaded successfully:', file.originalname, 'URL:', cloudResult.url);
        } catch (uploadError) {
          console.error('Error uploading file:', file.originalname, uploadError);
          return res.status(500).json({
            success: false,
            message: `Failed to upload file: ${file.originalname}`
          });
        }
      }
    } else {
      // No files found in request
    }

    // Generate tracking ID manually
    const count = await Application.countDocuments({ serviceId: serviceId });
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
    const generatedTrackingId = `${code}${year}${sequence}`;

    const application = await Application.create({
      userId: req.user._id,
      serviceId,
      trackingId: generatedTrackingId,
      formData,
      status: 'pending',
      uploadedDocuments,
      timeline: [
        {
          status: 'submitted',
          date: new Date(),
          actor: req.user._id
        }
      ]
    });

    // Increment the applicationCount for the service
    if (service && typeof service.incrementApplicationCount === 'function') {
      await service.incrementApplicationCount();
    }

    // Create notification for application submission
    const notificationData = {
      ...application.toObject(),
      serviceName: service.title
    };
    await NotificationService.createApplicationNotification(req.user._id, notificationData, req);

    res.status(201).json({
      success: true,
      message: translate(req, 'application.submitted'),
      data: application
    });
  } catch (error) {
    console.error('Error in submitApplication:', error);
    next(error);
  }
};

// @desc    Get current user's applications
// @route   GET /api/applications/my
// @access  Private/User
const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: new mongoose.Types.ObjectId(req.user._id) })
      .populate('serviceId');

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (admin)
// @route   GET /api/admin/applications
// @access  Private/Admin
const getAllApplications = async (req, res, next) => {
  try {
    const apps = await Application.find().populate('serviceId').populate('userId');

    res.status(200).json({
      success: true,
      count: apps.length,
      data: apps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for staff's department
// @route   GET /api/staff/applications
// @access  Private/Staff
const getDepartmentApplications = async (req, res, next) => {
  try {
    const services = await Service.find({ department: req.user.department }).select('_id');
    const serviceIds = services.map(service => service._id);

    const apps = await Application.find({ serviceId: { $in: serviceIds } })
      .populate('serviceId')
      .populate('userId');

    // Map serviceId to service for frontend compatibility
    const mappedApps = apps.map(app => ({
      ...app.toObject(),
      service: app.serviceId,
      user: app.userId,
      documents: app.uploadedDocuments || []
    }));

    res.status(200).json({
      success: true,
      count: mappedApps.length,
      data: mappedApps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (staff/admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Staff+SubRole: application_processor
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'application.notFound')
      });
    }

    application.status = status;
    application.timeline.push({
      status,
      date: new Date(),
      actor: req.user._id
    });

    await application.save();

    // Create notification for status update
    const service = await Service.findById(application.serviceId);
    const notificationData = {
      ...application.toObject(),
      serviceName: service ? service.title : 'Unknown Service'
    };
    await NotificationService.createStatusUpdateNotification(application.userId, notificationData, status, req);

    res.status(200).json({
      success: true,
      message: translate(req, 'application.statusUpdated'),
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify uploaded documents (staff sub-role)
// @route   PUT /api/applications/:id/verify-documents
// @access  Private/Staff+SubRole: document_verifier
const verifyDocuments = async (req, res, next) => {
  try {
    const { verifiedDocs } = req.body; // array of { fileUrl, status, comment }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'application.notFound')
      });
    }

    application.uploadedDocuments = verifiedDocs;
    application.timeline.push({
      status: 'documents_verified',
      date: new Date(),
      actor: req.user._id
    });

    await application.save();

    // Create notifications for document verification
    for (const doc of verifiedDocs) {
      await NotificationService.createDocumentVerificationNotification(
        application.userId,
        application,
        doc.name,
        doc.status,
        req
      );
    }

    res.status(200).json({
      success: true,
      message: translate(req, 'application.documentsVerified'),
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add internal comment (staff/admin)
// @route   POST /api/applications/:id/comment
// @access  Private/Staff/Admin
const addApplicationComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'application.notFound')
      });
    }

    application.comments.push({
      by: req.user._id,
      message,
      date: new Date()
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: translate(req, 'application.commentAdded')
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application receipt data (for PDF)
// @route   GET /api/applications/:id/receipt
// @access  Private/User
const getApplicationReceipt = async (req, res, next) => {
  try {
    const app = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('serviceId');

    if (!app) {
      return res.status(404).json({
        success: false,
        message: translate(req, 'application.notFound')
      });
    }

    res.status(200).json({
      success: true,
      data: {
        applicant: req.user,
        service: app.serviceId,
        timeline: app.timeline,
        status: app.status,
        submittedAt: app.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status and comment for a specific uploaded document
// @route   PUT /api/staff/applications/:appId/documents/:docName
// @access  Private/Staff
const updateDocumentStatus = async (req, res, next) => {
  try {
    const { appId, docName } = req.params;
    const { status, comment } = req.body;
    const application = await Application.findById(appId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    const doc = application.uploadedDocuments.find(d => d.name === docName);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    if (status) {
      doc.status = status;
      if (status === 'verified') {
        doc.verifiedBy = req.user._id;
        doc.verifiedAt = new Date();
      }
    }
    if (comment) {
      doc.verificationComment = comment;
    }
    await application.save();
    
    // Create notification for document status update
    await NotificationService.createDocumentVerificationNotification(
      application.userId,
      application,
      doc.name,
      status,
      req
    );
    
    res.status(200).json({ success: true, message: 'Document updated', document: doc });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getUserApplications,
  getAllApplications,
  getDepartmentApplications,
  updateApplicationStatus,
  verifyDocuments,
  addApplicationComment,
  getApplicationReceipt,
  updateDocumentStatus
};
