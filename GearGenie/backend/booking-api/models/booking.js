const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  preferredDate: String,
  preferredTime: String,
  centreName: String,
  issueType: String,

  serviceType: { type: String, enum: ["pickup", "visit"], required: true }, // <— NEW

  address: { type: String }, // <— stores pickup address if provided

  location: {
    lat: Number,
    lon: Number,
  },

  obdData: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);
