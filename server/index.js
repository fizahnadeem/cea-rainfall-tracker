const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const connectDB = require('./db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { logApiRequest } = require('./utils/logger');

// Import routes
const apiRoutes = require('./routes/apiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Cookie parser middleware
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use('/admin', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(logApiRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CEA Rainfall Tracker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CEA Rainfall Tracker API',
    version: '1.0.0',
    endpoints: {
      public: {
        'GET /api/rainfall/all': 'Get all rainfall records',
        'GET /api/rainfall/day/:date': 'Get rainfall for all locations on a specific day',
        'GET /api/rainfall/location/:area': 'Get all rainfall data for a specific location',
        'GET /api/rainfall/:area/:date': 'Get rainfall for a specific location and date',
        'GET /api/areas': 'Get list of available areas',
        'GET /api/stats': 'Get basic statistics'
      },
      admin: {
        'POST /admin/rainfall': 'Add new rainfall entry',
        'PUT /admin/rainfall/:id': 'Update rainfall record',
        'DELETE /admin/rainfall/:id': 'Delete rainfall record',
        'GET /admin/rainfall': 'Get all rainfall records (with pagination)',
        'POST /admin/users': 'Create new API user',
        'GET /admin/users': 'Get all users',
        'DELETE /admin/users/:id': 'Delete user'
      }
    },
    authentication: 'All endpoints require x-api-key header',
    adminAccess: 'Admin endpoints require isAdmin: true in user record'
  });
});

// Routes
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CEA Rainfall Tracker API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 