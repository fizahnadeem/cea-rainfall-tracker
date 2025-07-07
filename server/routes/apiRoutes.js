const express = require('express');
const router = express.Router();
const Rainfall = require('../models/Rainfall');
const User = require('../models/User');
const { verifyApiKey } = require('../middleware/verifyApiKey');
const { setApiKeyCookie } = require('../utils/cookieUtils');
const { sanitizeInput } = require('../middleware/sanitizeInput');
const { logApiRequest } = require('../utils/logger');
const { generateApiKey } = require('../utils/generateApiKey');
const { generateJwtToken } = require('../utils/generateApiKey');

// Apply middleware to all routes except registration
router.use(sanitizeInput);
router.use(logApiRequest);

// Apply API key verification to all routes except login and registration
router.use((req, res, next) => {
   if (req.path === '/login' || req.path === '/register') {
      return next();
   }
   return verifyApiKey(req, res, next);
});

// GET /api/rainfall/all - Get all rainfall records
router.get('/rainfall/all', async (req, res) => {
   try {
      const rainfall = await Rainfall.find()
         .sort({ date: -1, area: 1 })
         .limit(100); // Limit to prevent overwhelming responses

      res.json({
         success: true,
         count: rainfall.length,
         data: rainfall
      });
   } catch (error) {
      console.error('Error fetching all rainfall data:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching rainfall data'
      });
   }
});

// GET /api/rainfall/day/:date - Get rainfall for all locations on a specific day
router.get('/rainfall/day/:date', async (req, res) => {
   try {
      const { date } = req.params;
      const targetDate = new Date(date);

      if (isNaN(targetDate.getTime())) {
         return res.status(400).json({
            success: false,
            message: 'Invalid date format. Please use YYYY-MM-DD format.'
         });
      }

      const rainfall = await Rainfall.find({
         date: {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lt: new Date(targetDate.setHours(23, 59, 59, 999))
         }
      }).sort({ area: 1 });

      res.json({
         success: true,
         date: date,
         count: rainfall.length,
         data: rainfall
      });
   } catch (error) {
      console.error('Error fetching rainfall by date:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching rainfall data for the specified date'
      });
   }
});

// GET /api/rainfall/location/:area - Get all rainfall data for a specific location
router.get('/rainfall/location/:area', async (req, res) => {
   try {
      const { area } = req.params;
      const validAreas = ['Erean', 'Bylyn', 'Docia', 'Brunad', 'Pryn', 'Vertwall', 'Yaean', 'Holmer'];

      if (!validAreas.includes(area)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid area. Must be one of: ' + validAreas.join(', ')
         });
      }

      const rainfall = await Rainfall.find({ area })
         .sort({ date: -1 })
         .limit(50); // Limit to prevent overwhelming responses

      res.json({
         success: true,
         area: area,
         count: rainfall.length,
         data: rainfall
      });
   } catch (error) {
      console.error('Error fetching rainfall by location:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching rainfall data for the specified location'
      });
   }
});

// GET /api/rainfall/:area/:date - Get rainfall for a specific location and date
router.get('/rainfall/:area/:date', async (req, res) => {
   try {
      const { area, date } = req.params;
      const validAreas = ['Erean', 'Bylyn', 'Docia', 'Brunad', 'Pryn', 'Vertwall', 'Yaean', 'Holmer'];

      if (!validAreas.includes(area)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid area. Must be one of: ' + validAreas.join(', ')
         });
      }

      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
         return res.status(400).json({
            success: false,
            message: 'Invalid date format. Please use YYYY-MM-DD format.'
         });
      }

      const rainfall = await Rainfall.findOne({
         area,
         date: {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lt: new Date(targetDate.setHours(23, 59, 59, 999))
         }
      });

      if (!rainfall) {
         return res.status(404).json({
            success: false,
            message: `No rainfall data found for ${area} on ${date}`
         });
      }

      res.json({
         success: true,
         data: rainfall
      });
   } catch (error) {
      console.error('Error fetching specific rainfall data:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching rainfall data'
      });
   }
});

// GET /api/areas - Get list of available areas
router.get('/areas', async (req, res) => {
   try {
      const areas = ['Erean', 'Bylyn', 'Docia', 'Brunad', 'Pryn', 'Vertwall', 'Yaean', 'Holmer'];

      res.json({
         success: true,
         data: areas
      });
   } catch (error) {
      console.error('Error fetching areas:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching areas list'
      });
   }
});

// GET /api/stats - Get basic statistics
router.get('/stats', async (req, res) => {
   try {
      const totalRecords = await Rainfall.countDocuments();
      const areas = await Rainfall.distinct('area');
      const dateRange = await Rainfall.aggregate([
         {
            $group: {
               _id: null,
               earliestDate: { $min: '$date' },
               latestDate: { $max: '$date' }
            }
         }
      ]);

      res.json({
         success: true,
         data: {
            totalRecords,
            totalAreas: areas.length,
            areas,
            dateRange: dateRange[0] || { earliestDate: null, latestDate: null }
         }
      });
   } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching statistics'
      });
   }
});



// POST /api/login - User login
router.post('/login', async (req, res) => {
   try {
      const { email, password } = req.body;

      console.log('Login attempt:', { email, passwordLength: password?.length });

      // Validate input
      if (!email || !email.includes('@')) {
         console.log('Invalid email format');
         return res.status(400).json({
            success: false,
            message: 'Valid email is required'
         });
      }

      if (!password || password.length < 6) {
         console.log('Invalid password');
         return res.status(400).json({
            success: false,
            message: 'Password is required (minimum 6 characters)'
         });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      console.log('User found:', user ? { email: user.email, hasPassword: !!user.password, isAdmin: user.isAdmin } : 'Not found');

      if (!user) {
         return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
         });
      }

      // For now, simple password check (we'll add bcrypt later)
      if (user.password !== password) {
         console.log('Password mismatch. Expected:', user.password, 'Got:', password);
         return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
         });
      }

      // Enforce isAdmin only for testadmin@centrala.com
      const isAdmin = user.email === 'testadmin@centrala.com';
      if (user.isAdmin !== isAdmin) {
         user.isAdmin = isAdmin;
         await user.save();
      }

      // Update last used timestamp
      user.lastUsed = new Date();
      await user.save();

      // Generate JWT token
      const jwtToken = generateJwtToken({
         email: user.email,
         isAdmin: user.isAdmin,
         userId: user._id
      });

      // Update user's apiKey in the database to match the JWT token
      user.apiKey = jwtToken;
      await user.save();

      // Set JWT as HTTP-only cookie
      res.cookie('jwt', jwtToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
      });

      console.log('Login successful for:', user.email);
      res.json({
         success: true,
         message: 'Login successful',
         data: {
            email: user.email,
            token: jwtToken,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt
         }
      });
   } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
         success: false,
         message: 'Error during login'
      });
   }
});

// POST /api/register - Public user registration
router.post('/register', async (req, res) => {
   try {
      const { email, password } = req.body;

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

      // Check for duplicate email
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
         return res.status(409).json({
            success: false,
            message: 'Email is already registered'
         });
      }

      // Only testadmin@centrala.com can be admin
      const isAdmin = email.toLowerCase() === 'testadmin@centrala.com';

      // Generate API key
      const apiKey = generateApiKey();

      // Create new user
      const newUser = new User({
         email: email.toLowerCase(),
         password,
         apiKey,
         apiAccess: 'none',
         isAdmin
      });
      await newUser.save();

      res.status(201).json({
         success: true,
         message: 'Registration successful. You can now log in.',
         apiKey
      });
   } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({
         success: false,
         message: 'Error during registration'
      });
   }
});

// POST /api/logout - User logout
router.post('/logout', (req, res) => {
   res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
   });
   res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/request-access - Generate and return an API key for the authenticated user
router.post('/request-access', async (req, res) => {
   try {
      // User must be authenticated (req.user set by JWT middleware)
      if (!req.user || !req.user.userId) {
         return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const user = await User.findById(req.user.userId);
      if (!user) {
         return res.status(404).json({ success: false, message: 'User not found.' });
      }
      // Generate a new API key
      const apiKey = generateApiKey();
      user.apiKey = apiKey;
      await user.save();
      res.json({ success: true, apiKey });
   } catch (error) {
      console.error('Error generating API key:', error);
      res.status(500).json({ success: false, message: 'Error generating API key.' });
   }
});

// Admin routes for rainfall management
// POST /api/admin/rainfall - Create new rainfall record (admin only)
router.post('/admin/rainfall', async (req, res) => {
   try {
      // Check if user is admin
      if (!req.user || !req.user.isAdmin) {
         return res.status(403).json({
            success: false,
            message: 'Admin access required'
         });
      }

      const { area, date, am1, am2, pm1, pm2 } = req.body;

      // Validate required fields
      if (!area || !date || am1 === undefined || am2 === undefined || pm1 === undefined || pm2 === undefined) {
         return res.status(400).json({
            success: false,
            message: 'All fields are required: area, date, am1, am2, pm1, pm2'
         });
      }

      // Validate area
      const validAreas = ['Erean', 'Bylyn', 'Docia', 'Brunad', 'Pryn', 'Vertwall', 'Yaean', 'Holmer'];
      if (!validAreas.includes(area)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid area. Must be one of: ' + validAreas.join(', ')
         });
      }

      // Validate date
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
         return res.status(400).json({
            success: false,
            message: 'Invalid date format'
         });
      }

      // Check if record already exists for this area and date
      const existingRecord = await Rainfall.findOne({
         area,
         date: {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lt: new Date(targetDate.setHours(23, 59, 59, 999))
         }
      });

      if (existingRecord) {
         return res.status(409).json({
            success: false,
            message: `Rainfall record already exists for ${area} on ${date}`
         });
      }

      // Validate rainfall values
      if (am1 < 0 || am2 < 0 || pm1 < 0 || pm2 < 0) {
         return res.status(400).json({
            success: false,
            message: 'Rainfall values cannot be negative'
         });
      }

      // Create new rainfall record
      const newRainfall = new Rainfall({
         area,
         date: targetDate,
         am1: parseFloat(am1),
         am2: parseFloat(am2),
         pm1: parseFloat(pm1),
         pm2: parseFloat(pm2)
      });

      await newRainfall.save();

      res.status(201).json({
         success: true,
         message: 'Rainfall record created successfully',
         data: newRainfall
      });
   } catch (error) {
      console.error('Error creating rainfall record:', error);
      res.status(500).json({
         success: false,
         message: 'Error creating rainfall record'
      });
   }
});

// PUT /api/admin/rainfall/:id - Update rainfall record (admin only)
router.put('/admin/rainfall/:id', async (req, res) => {
   try {
      // Check if user is admin
      if (!req.user || !req.user.isAdmin) {
         return res.status(403).json({
            success: false,
            message: 'Admin access required'
         });
      }

      const { id } = req.params;
      const { area, date, am1, am2, pm1, pm2 } = req.body;

      // Validate required fields
      if (!area || !date || am1 === undefined || am2 === undefined || pm1 === undefined || pm2 === undefined) {
         return res.status(400).json({
            success: false,
            message: 'All fields are required: area, date, am1, am2, pm1, pm2'
         });
      }

      // Validate area
      const validAreas = ['Erean', 'Bylyn', 'Docia', 'Brunad', 'Pryn', 'Vertwall', 'Yaean', 'Holmer'];
      if (!validAreas.includes(area)) {
         return res.status(400).json({
            success: false,
            message: 'Invalid area. Must be one of: ' + validAreas.join(', ')
         });
      }

      // Validate date
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
         return res.status(400).json({
            success: false,
            message: 'Invalid date format'
         });
      }

      // Validate rainfall values
      if (am1 < 0 || am2 < 0 || pm1 < 0 || pm2 < 0) {
         return res.status(400).json({
            success: false,
            message: 'Rainfall values cannot be negative'
         });
      }

      // Find and update the record
      const updatedRainfall = await Rainfall.findByIdAndUpdate(
         id,
         {
            area,
            date: targetDate,
            am1: parseFloat(am1),
            am2: parseFloat(am2),
            pm1: parseFloat(pm1),
            pm2: parseFloat(pm2)
         },
         { new: true, runValidators: true }
      );

      if (!updatedRainfall) {
         return res.status(404).json({
            success: false,
            message: 'Rainfall record not found'
         });
      }

      res.json({
         success: true,
         message: 'Rainfall record updated successfully',
         data: updatedRainfall
      });
   } catch (error) {
      console.error('Error updating rainfall record:', error);
      res.status(500).json({
         success: false,
         message: 'Error updating rainfall record'
      });
   }
});

// DELETE /api/admin/rainfall/:id - Delete rainfall record (admin only)
router.delete('/admin/rainfall/:id', async (req, res) => {
   try {
      // Check if user is admin
      if (!req.user || !req.user.isAdmin) {
         return res.status(403).json({
            success: false,
            message: 'Admin access required'
         });
      }

      const { id } = req.params;

      const deletedRainfall = await Rainfall.findByIdAndDelete(id);

      if (!deletedRainfall) {
         return res.status(404).json({
            success: false,
            message: 'Rainfall record not found'
         });
      }

      res.json({
         success: true,
         message: 'Rainfall record deleted successfully',
         data: deletedRainfall
      });
   } catch (error) {
      console.error('Error deleting rainfall record:', error);
      res.status(500).json({
         success: false,
         message: 'Error deleting rainfall record'
      });
   }
});

module.exports = router; 