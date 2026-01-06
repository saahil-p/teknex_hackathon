import mongoose from "mongoose";

const ObdReadingSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true },
    dealershipId: { type: String },
    phone: {                    // ✅ NEW: link with booking
      type: String,
      required: true,
    },
    obdData: {
      type: Object,
      required: true,
    },
    analysis: {                 // yahi pe AI summary aa rahi hai
      type: String,
    },
    isAnalysed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


const ObdReading = mongoose.model("ObdReading", ObdReadingSchema);

export default ObdReading;
