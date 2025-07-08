const Application = require('../models/Application');
const Document = require('../models/Document');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');

exports.uploadDocuments = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    // Check if application exists and belongs to user
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    for (const file of files) {
      // Upload to Cloudinary (buffer-based)
      const cloudResult = await uploadToCloudinary({
        buffer: file.buffer,
        originalname: file.originalname
      }, 'applications');
      // Save document info in DB
      const documentInfo = {
        name: file.originalname,
        url: cloudResult.url,
        publicId: cloudResult.publicId,
        size: file.size,
        format: cloudResult.format,
        status: 'pending',
        uploadedAt: new Date()
      };
      application.uploadedDocuments.push(documentInfo);
    }
    await application.save();
    res.status(201).json({ 
      message: 'Documents uploaded successfully',
      data: application.uploadedDocuments 
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

exports.getApplicationDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Check if application belongs to user
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const documents = await Document.find({ applicationId });
    res.json({ data: documents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await Document.findByIdAndDelete(documentId);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
}; 

// New: Get all uploaded documents for the logged-in user, with service info
exports.getUserDocuments = async (req, res) => {
  try {
    // Get documents from separate Document model
    const separateDocuments = await Document.find({ userId: req.user._id })
      .populate({
        path: 'applicationId',
        populate: { path: 'serviceId', select: 'title' }
      });

    // Get documents from Application.uploadedDocuments
    const applications = await Application.find({ userId: req.user._id })
      .populate('serviceId', 'title');

    const applicationDocuments = [];
    applications.forEach(app => {
      if (app.uploadedDocuments && app.uploadedDocuments.length > 0) {
        app.uploadedDocuments.forEach(doc => {
          applicationDocuments.push({
            _id: doc._id || `${app._id}_${doc.name}`,
            fileName: doc.name,
            url: doc.url,
            status: doc.status || 'pending',
            createdAt: doc.uploadedAt || app.createdAt,
            applicationId: {
              _id: app._id,
              serviceId: {
                _id: app.serviceId._id,
                title: app.serviceId.title
              }
            }
          });
        });
      }
    });

    // Combine both sources
    const allDocuments = [...separateDocuments, ...applicationDocuments];
    
    // Sort by creation date (newest first)
    allDocuments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ data: allDocuments });
  } catch (err) {
    console.error('Error fetching user documents:', err);
    res.status(500).json({ error: 'Failed to fetch user documents' });
  }
}; 