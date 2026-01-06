import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Dealer from "../models/Dealer.js";

const router = express.Router();

// ==========================
//   DEALER SIGNUP
// ==========================
router.post("/register", async (req, res) => {
  const { name, garageName, email, password } = req.body;

  // Validation
  if (!name || !garageName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const lowerEmail = email.toLowerCase();

  // Check if dealer already exists
  const exists = await Dealer.findOne({ email: lowerEmail });
  if (exists) {
    return res.status(400).json({ message: "Dealer already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create dealer
  await Dealer.create({
    name,
    garageName,
    email: lowerEmail,
    password: hashedPassword,
  });

  res.json({ message: "Signup successful" });
});

// ==========================
//   DEALER LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const lowerEmail = email.toLowerCase();

    const dealer = await Dealer.findOne({ email: lowerEmail });
    if (!dealer)
      return res.status(400).json({ message: "Dealer not found" });

    console.log("Typed password:", password);
    console.log("DB hashed password:", dealer.password);

    const isMatch = await bcrypt.compare(password, dealer.password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: dealer._id },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.json({
  success: true,
  token,
  dealer: {
    id: dealer._id,
    name: dealer.name,
    email: dealer.email,
    garageName: dealer.garageName
  }
});

  } catch (err) {
    console.error("LOGIN ERROR:", err);  // 🔥 IMPORTANT
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Export router (IMPORTANT)
export default router;
