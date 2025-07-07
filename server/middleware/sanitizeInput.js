const { body, validationResult } = require('express-validator');
const { logSecurityEvent } = require('../utils/logger');

// Sanitize and validate rainfall data
const sanitizeRainfallData = [
  body('area')
    .trim()
    .isIn(['Erean', 'Bylyn', 'Docia', 'Brunad', 'Pryn', 'Vertwall', 'Yaean', 'Holmer'])
    .withMessage('Invalid area. Must be one of the predefined locations.'),
  
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date format.'),
  
  body('am1')
    .isFloat({ min: 0, max: 100 })
    .withMessage('AM1 must be a number between 0 and 100.'),
  
  body('am2')
    .isFloat({ min: 0, max: 100 })
    .withMessage('AM2 must be a number between 0 and 100.'),
  
  body('pm1')
    .isFloat({ min: 0, max: 100 })
    .withMessage('PM1 must be a number between 0 and 100.'),
  
  body('pm2')
    .isFloat({ min: 0, max: 100 })
    .withMessage('PM2 must be a number between 0 and 100.')
];

// Sanitize user registration data
const sanitizeUserData = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean value.')
];

// Generic input sanitization
const sanitizeInput = (req, res, next) => {
  // Remove any potential script tags or dangerous HTML
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  };

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    });
  }

  next();
};

// Check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logSecurityEvent('Validation Error', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      errors: errors.array()
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  sanitizeInput,
  sanitizeRainfallData,
  sanitizeUserData,
  handleValidationErrors
}; 