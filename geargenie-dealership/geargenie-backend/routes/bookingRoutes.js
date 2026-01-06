import express from "express";
import Booking from "../models/Booking.js";
import { generateAIMechanicSummary } from "../controllers/aicontroller.js";

const router = express.Router();

/* ---------------------------------------------------
   CREATE BOOKING (From Mobile App)
--------------------------------------------------- */
router.post("/create", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------
   GET ALL BOOKINGS (OEM Dashboard)
--------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------
   DASHBOARD SUMMARY (TOTAL, DOORSTEP, CENTER)
--------------------------------------------------- */
router.get("/stats/summary", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      total,
      doorstep,
      center,
      pending,
      accepted,
      rejected,
      todayCount
    ] = await Promise.all([

      Booking.countDocuments(),

      Booking.countDocuments({
        serviceType: { $in: ["pickup", "doorstep"] }
      }),

      Booking.countDocuments({
        serviceType: "visit"
      }),

      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "accepted" }),
      Booking.countDocuments({ status: "rejected" }),

      // Today’s bookings ONLY
      Booking.countDocuments({
        createdAt: { $gte: today }
      })
    ]);

    res.json({
      success: true,
      stats: {
        total,
        doorstep,
        center,
        pending,
        accepted,
        rejected,
        today: todayCount
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------
   GET SINGLE BOOKING DETAILS
--------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------
   UPDATE BOOKING STATUS (Accept / Reject)
--------------------------------------------------- */
router.put("/:id/status", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------
   ⭐ NEW: GENERATE AI MECHANIC SUMMARY
--------------------------------------------------- */
router.post("/:id/ai-summary", generateAIMechanicSummary);

export default router;
