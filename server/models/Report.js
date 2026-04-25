// models/Report.js
const mongoose = require('mongoose');

const shopReportSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  pickup: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sellout: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  remaining: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const reportSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  shops: [shopReportSchema],
  totalPickup: {
    type: Number,
    default: 0
  },
  totalSellout: {
    type: Number,
    default: 0
  },
  totalRemaining: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reports for same driver on same day
reportSchema.index({ driver: 1, date: 1 }, { unique: true });

// Calculate totals before saving
reportSchema.pre('save', function(next) {
  this.totalPickup = this.totalPickup;
  this.totalSellout = this.shops.reduce((sum, shop) => sum + shop.sellout, 0);
  this.totalRemaining = this.totalPickup - this.totalSellout;
  
  // Calculate remaining for each shop
  this.shops.forEach(shop => {
    shop.remaining = shop.pickup - shop.sellout;
  });
  
  next();
});

module.exports = mongoose.model('Report', reportSchema);