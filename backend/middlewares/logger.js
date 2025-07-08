const Log = require('../models/Log');
const logger = require('../utils/logger');

// Middleware to log user actions
const logAction = (action, entityType = null) => {
  return async (req, res, next) => {
    try {
      // Store original res.json to capture response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Only log successful actions (status < 400)
        if (res.statusCode < 400 && req.user) {
          // Create log entry asynchronously
          setImmediate(async () => {
            try {
              await Log.create({
                action,
                performedBy: req.user._id,
                role: req.user.role,
                department: req.user.department,
                entityType,
                entityId: req.params.id || req.body.id || data?.data?._id,
                metadata: {
                  method: req.method,
                  url: req.originalUrl,
                  statusCode: res.statusCode,
                  userAgent: req.get('User-Agent'),
                  body: req.method !== 'GET' ? req.body : undefined
                },
                ipAddress: req.ip || req.connection.remoteAddress
              });
            } catch (logError) {
              logger.error('Failed to create log entry:', logError);
            }
          });
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Logger middleware error:', error);
      next();
    }
  };
};

module.exports = { logAction };