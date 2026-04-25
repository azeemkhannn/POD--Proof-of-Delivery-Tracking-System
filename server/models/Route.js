// models/Route.js
const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  contact: {
    type: String,
    match: [/^[0-9]{11}$/, 'Please enter a valid 11-digit phone number']
  },
  targetAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  sequence: {
    type: Number,
    default: 0 // Order of shops in route
  }
}, { _id: true });

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  shops: [shopSchema],
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deliveryDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
routeSchema.index({ assignedDriver: 1, isActive: 1 });

// Method to check if route is available today
routeSchema.methods.isAvailableToday = function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return this.deliveryDays.includes(today);
};

module.exports = mongoose.model('Route', routeSchema);