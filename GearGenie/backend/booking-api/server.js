require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Booking = require("./models/booking");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({ origin: "*" }));  // allow requests from any origin


// 🔥 Connect MongoDB using .env variable
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Mongo DB Error:", err));


// ================= ROUTES ================= //

// Import service estimate routes
const serviceEstimateRoutes = require("./routes/serviceEstimateRoutes");

// Use service estimate routes
app.use("/api/service-estimates", serviceEstimateRoutes);


// Submit booking from app
app.post("/book", async (req, res) => {
  try {
    await Booking.create(req.body);
    return res.json({ success:true, message:"Booking stored successfully!" });
  } catch (error) {
    return res.json({ success:false, message:"Failed to save booking" });
  }
});

// Dealer/Admin fetch all bookings
app.get("/bookings", async (req, res) => {
  const data = await Booking.find().sort({ createdAt:-1 });
  return res.json(data);
});

app.get("/", (req,res)=> res.send("Booking API running ✓"));


// Start server
app.listen(5000, () => console.log("Booking API running on port 5000"));
