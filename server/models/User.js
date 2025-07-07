const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
   },
   password: {
      type: String,
      required: true,
      minlength: 6
   },
   apiKey: {
      type: String,
      unique: true,
      sparse: true // Allows multiple null values
   },
   isAdmin: {
      type: Boolean,
      default: false
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   lastUsed: {
      type: Date,
      default: Date.now
   }
});

module.exports = mongoose.model('User', userSchema); 