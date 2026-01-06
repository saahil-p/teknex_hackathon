import React from "react";
import { Link } from "react-router-dom";
import "./welcome.css";

function Welcome() {
  return (
    <div className="welcome-container">

      {/* TOP BRAND LOGO + TITLE */}
      <div className="logo-wrap">
        <img src="/geargenie-logo.jpeg" alt="GearGenie Logo" className="gg-logo" />
        <span className="brand-name">GearGenie Dealership</span>
      </div>

      {/* CARD */}
      <div className="welcome-card">
        <h1 className="title">Hello Dealer 👋</h1>
        <p className="subtitle">Welcome to GearGenie Dealership Portal</p>

        <div className="button-group">
          <Link to="/login">
            <button className="btn">Login</button>
          </Link>

          <Link to="/signup">
            <button className="btn secondary">Signup</button>
          </Link>
        </div>
      </div>

    </div>
  );
}

export default Welcome;
