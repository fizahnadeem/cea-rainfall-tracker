const express = require('express');
const router = express.Router();
const Rainfall = require('../models/Rainfall');
const User = require('../models/User');
const Request = require('../models/Request');
const { verifyApiKey, requireAdmin } = require('../middleware/verifyApiKey');
const { sanitizeInput, sanitizeRainfallData, handleValidationErrors } = require('../middleware/sanitizeInput');
const { logApiRequest } = require('../utils/logger');

// Apply middleware to all routes
router.use(verifyApiKey);
router.use(requireAdmin);
router.use(sanitizeInput);
router.use(logApiRequest);

// POST /admin/rainfall - Add new rainfall entry
router.post('/rainfall', sanitizeRainfallData, handleValidationErrors, async (req, res) => {
  try {
    const { area, date, am1, am2, pm1, pm2 } = req.body;

    // Check if record already exists for this area and date
    const existingRecord = await Rainfall.findOne({
      area,
      date: new Date(date)
    });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: `Rainfall record already exists for ${area} on ${date}`
      });
    }

    const rainfall = new Rainfall({
      area,
      date: new Date(date),
      am1: parseFloat(am1),
      am2: parseFloat(am2),
      pm1: parseFloat(pm1),
      pm2: parseFloat(pm2)
    });

    await rainfall.save();

    res.status(201).json({
      success: true,
      message: 'Rainfall record created successfully',
      data: rainfall
    });
  } catch (error) {
    console.error('Error creating rainfall record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating rainfall record'
    });
  }
});

// PUT /admin/rainfall/:id - Update rainfall record
router.put('/rainfall/:id', sanitizeRainfallData, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { area, date, am1, am2, pm1, pm2 } = req.body;

    const rainfall = await Rainfall.findById(id);

    if (!rainfall) {
      return res.status(404).json({
        success: false,
        message: 'Rainfall record not found'
      });
    }

    // Check if the new area/date combination conflicts with another record
    if (area !== rainfall.area || new Date(date).toDateString() !== rainfall.date.toDateString()) {
      const existingRecord = await Rainfall.findOne({
        area,
        date: new Date(date),
        _id: { $ne: id }
      });

      if (existingRecord) {
        return res.status(409).json({
          success: false,
          message: `Rainfall record already exists for ${area} on ${date}`
        });
      }
    }

    rainfall.area = area;
    rainfall.date = new Date(date);
    rainfall.am1 = parseFloat(am1);
    rainfall.am2 = parseFloat(am2);
    rainfall.pm1 = parseFloat(pm1);
    rainfall.pm2 = parseFloat(pm2);

    await rainfall.save();

    res.json({
      success: true,
      message: 'Rainfall record updated successfully',
      data: rainfall
    });
  } catch (error) {
    console.error('Error updating rainfall record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating rainfall record'
    });
  }
});

// DELETE /admin/rainfall/:id - Delete rainfall record
router.delete('/rainfall/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const rainfall = await Rainfall.findByIdAndDelete(id);

    if (!rainfall) {
      return res.status(404).json({
        success: false,
        message: 'Rainfall record not found'
      });
    }

    res.json({
      success: true,
      message: 'Rainfall record deleted successfully',
      data: rainfall
    });
  } catch (error) {
    console.error('Error deleting rainfall record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting rainfall record'
    });
  }
});

// GET /admin/rainfall - Get all rainfall records (admin view with pagination)
router.get('/rainfall', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const rainfall = await Rainfall.find()
      .sort({ date: -1, area: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Rainfall.countDocuments();

    res.json({
      success: true,
      data: rainfall,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        recordsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rainfall data'
    });
  }
});

// POST /admin/users - Create new user (admin only)
router.post('/users', async (req, res) => {
  try {
    const { email, password, isAdmin = false } = req.body;

    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required (minimum 6 characters)'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate API key
    const { generateApiKey } = require('../utils/generateApiKey');
    const apiKey = generateApiKey();

    const user = new User({
      email: email.toLowerCase(),
      password, // Store password (we'll hash it later with bcrypt)
      apiKey,
      isAdmin: Boolean(isAdmin)
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        email: user.email,
        apiKey: user.apiKey,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

// GET /admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-apiKey') // Don't send API keys in response
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// DELETE /admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// GET /admin/requests - Get all API access requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('userId', 'email isAdmin')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
});

// POST /admin/requests/:id/approve - Approve API access request
router.post('/requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Generate API key for the user
    const { generateApiKey } = require('../utils/generateApiKey');
    const apiKey = generateApiKey();

    // Update user with API key
    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.apiKey = apiKey;
    await user.save();

    // Update request status
    request.status = 'approved';
    request.adminNotes = adminNotes || 'Request approved by administrator';
    request.reviewedBy = req.user._id; // From middleware
    request.reviewedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: {
        requestId: request._id,
        userId: user._id,
        email: user.email,
        apiKey: apiKey,
        status: request.status
      }
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving request'
    });
  }
});

// POST /admin/requests/:id/reject - Reject API access request
router.post('/requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required (minimum 5 characters)'
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Update request status
    request.status = 'rejected';
    request.adminNotes = reason.trim();
    request.reviewedBy = req.user._id; // From middleware
    request.reviewedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Request rejected successfully',
      data: {
        requestId: request._id,
        status: request.status,
        adminNotes: request.adminNotes
      }
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting request'
    });
  }
});

module.exports = router; 