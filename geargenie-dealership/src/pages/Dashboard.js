import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Layout from "../components/Layout"; // ⭐ USE LAYOUT HERE

function Dashboard() {
  const navigate = useNavigate();

  const dealer = JSON.parse(localStorage.getItem("dealer"));
  const dealerName = dealer?.name || "Dealer";

  const [stats, setStats] = useState({
    total: 0,
    doorstep: 0,
    center: 0,
    today: 0
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/bookings/stats/summary");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      
      {/* =============== DASHBOARD CONTENT =============== */}
      <div className="dashboard-header">
        <h1>Dealership Dashboard</h1>
        <p>Hello!, {dealerName}</p>
        <h2>Today's Overview</h2>
      </div>

      <div className="cards">

        <div className="card" onClick={() => navigate("/orders?filter=all")}>
          <h3>Total Bookings</h3>
          <p>{stats.total}</p>
        </div>

        <div className="card" onClick={() => navigate("/orders?filter=doorstep")}>
          <h3>Doorstep Service</h3>
          <p>{stats.doorstep}</p>
        </div>

        <div className="card" onClick={() => navigate("/orders?filter=today")}>
          <h3>Today's Bookings</h3>
          <p>{stats.today}</p>
        </div>

        <div className="card" onClick={() => navigate("/orders?filter=center")}>
          <h3>Service Centre Bookings</h3>
          <p>{stats.center}</p>
        </div>

      </div>

    </Layout>
  );
}

export default Dashboard;
