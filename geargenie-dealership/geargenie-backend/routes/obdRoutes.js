import express from "express";
import ObdReading from "../models/obdReading.js";
import Booking from "../models/Booking.js";   // ✅ IMPORT BOOKING MODEL

const router = express.Router();

// POST: create new OBD record
router.post("/", async (req, res) => {
  try {
    const { vehicleId, dealershipId, obdData, phone } = req.body;

    // Validation
    if (!vehicleId || !obdData || !phone) {
      return res.status(400).json({
        message: "vehicleId, phone, and obdData are required",
      });
    }

    // 👉 1. Save OBD reading
    const reading = await ObdReading.create({
      vehicleId,
      dealershipId,
      phone,       // ✅ store phone (important!)
      obdData,
    });

    // 👉 2. UPDATE BOOKING USING PHONE
    await Booking.findOneAndUpdate(
      { phone: phone },        // find booking by phone
      {
        $set: {
          obdData: obdData,    // store obd data inside booking
          status: "analysed",  // update booking status
        },
      },
      { new: true }
    );

    return res.status(201).json({
      message: "OBD reading saved & Booking updated",
      data: reading,
    });

  } catch (err) {
    console.error("Error creating OBD reading:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET: list all OBD readings (for dashboard)
router.get("/", async (req, res) => {
  try {
    const readings = await ObdReading.find().sort({ createdAt: -1 });
    return res.json(readings);
  } catch (err) {
    console.error("Error fetching OBD readings:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET: one reading
router.get("/:id", async (req, res) => {
  try {
    const reading = await ObdReading.findById(req.params.id);
    if (!reading) {
      return res.status(404).json({ message: "OBD reading not found" });
    }
    return res.json(reading);
  } catch (err) {
    console.error("Error fetching OBD reading:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
