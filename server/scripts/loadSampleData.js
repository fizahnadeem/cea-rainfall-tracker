const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const connectDB = require('../db');
const Rainfall = require('../models/Rainfall');
const User = require('../models/User');
const { generateApiKey } = require('../utils/generateApiKey');

const loadSampleData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Rainfall.deleteMany({});
    console.log('Cleared existing rainfall data');

    // Load CSV data
    const results = [];
    const csvPath = path.join(__dirname, '../sampleData/rainfall.csv');

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            area: data.area,
            date: new Date(data.date),
            am1: parseFloat(data.am1),
            am2: parseFloat(data.am2),
            pm1: parseFloat(data.pm1),
            pm2: parseFloat(data.pm2)
          });
        })
        .on('end', async () => {
          try {
            // Insert rainfall data
            await Rainfall.insertMany(results);
            console.log(`Loaded ${results.length} rainfall records`);

            // Create default admin user if none exists
            const adminExists = await User.findOne({ isAdmin: true });
            if (!adminExists) {
              const adminApiKey = generateApiKey();
              const adminUser = new User({
                email: 'admin@cea.gov',
                password: 'admin123', // Default password
                apiKey: adminApiKey,
                isAdmin: true
              });
              await adminUser.save();
              console.log('Created default admin user: admin@cea.gov');
              console.log('Admin Password: admin123');
              console.log('Admin API Key:', adminApiKey);
            }

            // Create default regular user if none exists
            const regularUserExists = await User.findOne({ isAdmin: false });
            if (!regularUserExists) {
              const userApiKey = generateApiKey();
              const regularUser = new User({
                email: 'user@example.com',
                password: 'user123', // Default password
                apiKey: userApiKey,
                isAdmin: false
              });
              await regularUser.save();
              console.log('Created default regular user: user@example.com');
              console.log('User Password: user123');
              console.log('User API Key:', userApiKey);
            }

            console.log('Sample data loaded successfully!');
            resolve();
          } catch (error) {
            console.error('Error inserting data:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          reject(error);
        });
    });

  } catch (error) {
    console.error('Error loading sample data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  loadSampleData()
    .then(() => {
      console.log('Data loading completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Data loading failed:', error);
      process.exit(1);
    });
}

module.exports = loadSampleData; 