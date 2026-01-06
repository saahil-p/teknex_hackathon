import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/dealer/login", {
        email,
        password,
      });

      setSuccessMsg("Login successful!");
      setErrorMsg("");

      localStorage.setItem("dealer", JSON.stringify(res.data.dealer));

      setTimeout(() => navigate("/dashboard"), 1200);

    } catch (err) {
      setErrorMsg("Invalid email or password.");
      setSuccessMsg("");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2 className="login-title">Dealer Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="input-box"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input-box"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn">Login</button>

        {/* Minimal text messages */}
        {successMsg && <p className="success-text">{successMsg}</p>}
        {errorMsg && <p className="error-text">{errorMsg}</p>}
      </form>
    </div>
  );
}

export default Login;
