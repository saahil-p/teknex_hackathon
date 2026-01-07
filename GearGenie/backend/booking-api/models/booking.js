const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  preferredDate: String,
  preferredTime: String,
  centreName: String,
  issueType: String,

  serviceType: { type: String, enum: ["pickup", "visit"], required: true },

  address: { type: String },

  location: {
    lat: Number,
    lon: Number,
  },

  obdData: Object,
  
  // Embedded service estimate instead of reference
 serviceEstimate: {
    estimates: [
      {
        component: String,
        status: String,
        recommendedService: String,
        estimatedHours: Number,
        estimatedCostUSD: Number
      }
    ],
    totalEstimatedHours: Number,
    totalEstimatedCostUSD: Number
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);