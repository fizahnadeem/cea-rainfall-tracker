const mongoose = require('mongoose');

const rainfallSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
    trim: true,
    enum: ['Erean', 'Bylyn', 'Docia', 'Brunad', 'Pryn', 'Vertwall', 'Yaean', 'Holmer']
  },
  date: {
    type: Date,
    required: true
  },
  am1: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  am2: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pm1: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pm2: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique area-date combinations
rainfallSchema.index({ area: 1, date: 1 }, { unique: true });

// Update the updatedAt field before saving
rainfallSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Rainfall', rainfallSchema); 