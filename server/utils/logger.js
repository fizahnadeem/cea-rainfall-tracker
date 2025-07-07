const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cea-rainfall-api' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom logging function for API requests
const logApiRequest = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    apiKey: req.headers['x-api-key'] ? req.headers['x-api-key'].substring(0, 8) + '...' : 'none',
    isAdmin: req.user ? req.user.isAdmin : false
  };

  logger.info('API Request', logData);
  next();
};

// Security event logging
const logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    timestamp: new Date().toISOString(),
    event,
    details
  });
};

// Error logging
const logError = (error, context = {}) => {
  logger.error('Application Error', {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context
  });
};

module.exports = {
  logger,
  logApiRequest,
  logSecurityEvent,
  logError
}; 