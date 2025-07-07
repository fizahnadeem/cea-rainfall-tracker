const { verifyJwtToken } = require('../utils/generateApiKey');
const { logSecurityEvent } = require('../utils/logger');

// JWT authentication middleware
const verifyApiKey = async (req, res, next) => {
   try {
      // Try to get token from Authorization header or cookie
      let token = null;
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
         token = authHeader.substring(7);
      } else if (req.cookies && req.cookies.jwt) {
         token = req.cookies.jwt;
      } else if (req.headers['x-api-key']) {
         // Fallback for legacy API key header (optional)
         token = req.headers['x-api-key'];
      }

      if (!token) {
         logSecurityEvent('Missing JWT Token', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl
         });
         return res.status(401).json({
            success: false,
            message: 'Authentication token is required.'
         });
      }

      // Verify JWT
      const decoded = verifyJwtToken(token);
      if (!decoded) {
         logSecurityEvent('Invalid JWT Token', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl
         });
         return res.status(403).json({
            success: false,
            message: 'Invalid or expired authentication token.'
         });
      }

      // Attach user info to request
      req.user = decoded;
      next();
   } catch (error) {
      console.error('JWT authentication error:', error);
      return res.status(500).json({
         success: false,
         message: 'Internal server error during authentication.'
      });
   }
};

const requireAdmin = (req, res, next) => {
   if (!req.user) {
      return res.status(401).json({
         success: false,
         message: 'Authentication required.'
      });
   }

   if (!req.user.isAdmin) {
      logSecurityEvent('Unauthorized Admin Access Attempt', {
         ip: req.ip,
         userAgent: req.get('User-Agent'),
         url: req.originalUrl,
         userId: req.user.userId,
         email: req.user.email
      });
      return res.status(403).json({
         success: false,
         message: 'Admin privileges required for this operation.'
      });
   }

   next();
};

module.exports = {
   verifyApiKey,
   requireAdmin
}; 