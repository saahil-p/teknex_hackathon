import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: String,

    preferredDate: String,
    preferredTime: String,

    centreName: String,
    issueType: String,
    serviceType: String,   // "visit" or "doorstep"

    location: {
      type: Object,
      default: {}
    },

    // OBD data from IoT device / app
    obdData: {
      type: Object,
      default: {}
    },

    // ⭐ NEW FIELD — AI-generated mechanic summary
    aiSummary: {
      type: String,
      default: ""
    },

    status: { 
      type: String, 
      default: "pending" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema, "bookings");
