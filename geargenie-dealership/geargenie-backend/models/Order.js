import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    vehicleId: { type: String, required: true },

    component: {
      type: String,
      enum: ["engine", "brake", "battery"],
      required: true,
    },

    serviceType: {
      type: String,
      enum: ["center", "doorstep"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
      default: "pending",
    },

    address: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
