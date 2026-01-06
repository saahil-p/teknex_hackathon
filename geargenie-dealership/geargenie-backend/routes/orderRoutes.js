import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// create order (used by React Native app)
router.post("/create", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// get all orders (used by OEM dashboard)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// GET dashboard stats (total, doorstep, center)
// GET: summary stats for dashboard
router.get("/stats/summary", async (req, res) => {
  try {
    const [
      totalOrders,
      doorstep,
      center,
      pending,
      accepted,
      rejected
    ] = await Promise.all([
      Order.countDocuments({}),                     // total
      Order.countDocuments({ serviceType: "doorstep" }),
      Order.countDocuments({ serviceType: "center" }),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "accepted" }),
      Order.countDocuments({ status: "rejected" })
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        doorstep,
        center,
        pending,
        accepted,
        rejected
      }
    });
  } catch (err) {
    console.error("Error in stats route:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// get single order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// update order status (accept / reject)
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order: updatedOrder });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


export default router;
