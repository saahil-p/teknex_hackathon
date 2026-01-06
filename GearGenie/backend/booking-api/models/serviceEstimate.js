const mongoose = require("mongoose");

const ServiceEstimateSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  estimates: [
    {
      component: String,
      status: String,
      recommendedService: String,
      estimatedHours: Number,
      estimatedCostUSD: Number,
    },
  ],
  totalEstimatedHours: { type: Number, required: true },
  totalEstimatedCostUSD: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ServiceEstimate", ServiceEstimateSchema);
