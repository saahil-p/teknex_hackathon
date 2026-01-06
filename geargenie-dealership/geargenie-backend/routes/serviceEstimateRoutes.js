const express = require("express");
const router = express.Router();
const ServiceEstimate = require("../models/serviceEstimatemodel");

// POST a new service estimate
router.post("/", async (req, res) => {
  try {
    const {
      vehicleId,
      estimates,
      totalEstimatedHours,
      totalEstimatedCostUSD,
    } = req.body;

    const newEstimate = new ServiceEstimate({
      vehicleId,
      estimates,
      totalEstimatedHours,
      totalEstimatedCostUSD,
    });

    const savedEstimate = await newEstimate.save();
    res.status(201).json(savedEstimate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all service estimates for a vehicle
router.get("/:vehicleId", async (req, res) => {
  try {
    const estimates = await ServiceEstimate.find({
      vehicleId: req.params.vehicleId,
    }).sort({ createdAt: -1 });
    res.json(estimates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
