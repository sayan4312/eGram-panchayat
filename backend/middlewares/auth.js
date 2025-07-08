const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { translate } = require('../utils/i18n');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: translate(req, 'auth.tokenRequired')
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: translate(req, 'auth.userNotFound')
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: translate(req, 'auth.accountDeactivated')
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: translate(req, 'auth.invalidToken')
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: translate(req, 'common.serverError')
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translate(req, 'auth.loginRequired')
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: translate(req, 'auth.insufficientPermissions')
      });
    }

    next();
  };
};

// Sub-role authorization for staff
const hasSubRole = (requiredSubRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translate(req, 'auth.loginRequired')
      });
    }

    if (req.user.role === 'admin') {
      // Admin has all permissions
      return next();
    }

    if (req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: translate(req, 'auth.staffRoleRequired')
      });
    }

    if (!req.user.subRoles || !req.user.subRoles.includes(requiredSubRole)) {
      return res.status(403).json({
        success: false,
        message: translate(req, 'auth.insufficientSubRolePermissions')
      });
    }

    next();
  };
};

// Department-based access control for staff
const departmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: translate(req, 'auth.loginRequired')
    });
  }

  if (req.user.role === 'admin') {
    // Admin has access to all departments
    return next();
  }

  if (req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: translate(req, 'auth.staffRoleRequired')
    });
  }

  if (!req.user.department) {
    return res.status(403).json({
      success: false,
      message: translate(req, 'auth.noDepartmentAssigned')
    });
  }

  req.userDepartment = req.user.department;
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: translate(req, 'auth.adminOnly')
    });
  }
  next();
};

const isStaff = (req, res, next) => {
  if (req.user?.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: translate(req, 'auth.staffOnly')
    });
  }
  next();
};


module.exports = {
  protect,
  authorize,
  hasSubRole,
  isAdmin,
  isStaff,
  departmentAccess
};