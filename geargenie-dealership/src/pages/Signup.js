import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [dealerName, setDealerName] = useState("");
  const [garageName, setGarageName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");     // ⭐ new
  const [success, setSuccess] = useState(false);  // ⭐ new

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/dealer/register", {
        name: dealerName,
        garageName,
        email,
        password,
      });

      // ⭐ Replace alert with beautiful success message
      setSuccess(true);
      setMessage("Signup successful!");

      // redirect after a delay
      setTimeout(() => navigate("/login"), 1200);

    } catch (err) {
      // ⭐ Replace alert with clean error message
      setSuccess(false);
      setMessage("Signup failed! Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-card" onSubmit={handleSignup}>
        <h2 className="signup-title">Create Account</h2>

        <input
          type="text"
          placeholder="Enter Dealer Name"
          className="input-box"
          value={dealerName}
          onChange={(e) => setDealerName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Garage Name"
          className="input-box"
          value={garageName}
          onChange={(e) => setGarageName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          className="input-box"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Create Password"
          className="input-box"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="signup-btn">Sign Up</button>

        {/* ⭐ Dynamic message below button */}
        {message && (
          <p className={success ? "success-text" : "error-text"}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default Signup;
