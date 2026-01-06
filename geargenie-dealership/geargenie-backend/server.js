import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ==========================
//       MIDDLEWARES
// ==========================
app.use(express.json());
app.use(cors());

// ==========================
//     CONNECT MONGODB
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log("Mongo Error ❌", err));

// ==========================
//        ROUTES IMPORT
// ==========================
import bookingRoutes from "./routes/bookingRoutes.js";
import dealerAuthRoutes from "./routes/dealerAuth.js";
import obdRoutes from "./routes/obdRoutes.js";   // ⭐ NEW — OBD ROUTE
import serviceEstimateRoutes from "./routes/serviceEstimateRoutes.js";

// ==========================
//         USE ROUTES
// ==========================
app.use("/api/bookings", bookingRoutes);
app.use("/api/dealer", dealerAuthRoutes);
app.use("/api/obd", obdRoutes);   // ⭐ BETTER + EASY PATH
app.use("/api/service-estimates", serviceEstimateRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚗 GearGenie Backend Running with AI!");
});

// ==========================
//       START SERVER
// ==========================
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
