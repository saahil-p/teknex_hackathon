import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Orders.css";
import Layout from "../components/Layout"; // ⭐ ADD THIS

function Orders() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ READ FILTER FROM URL
  const filterParam = new URLSearchParams(location.search).get("filter");

  // ⭐ SET ACTIVE TAB BASED ON URL
  const [activeTab, setActiveTab] = useState(
    filterParam === "center"
      ? "center"
      : filterParam === "doorstep"
      ? "doorstep"
      : filterParam === "today"
      ? "today"
      : "all"
  );

  // Fetch all bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/bookings");
      setBookings(res.data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  // ⭐ UPDATE BOOKING STATUS
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status: newStatus });

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Status update failed");
    }
  };

  // ⭐ FILTER LOGIC (URL + TAB both supported)
  let filteredBookings = bookings;

  // 🚚 Doorstep
  if (activeTab === "doorstep") {
    filteredBookings = bookings.filter(
      (b) =>
        b.serviceType?.toLowerCase() === "pickup" ||
        b.serviceType?.toLowerCase() === "doorstep"
    );
  }

  // 🏢 Centre
  if (activeTab === "center") {
    filteredBookings = bookings.filter(
      (b) => b.serviceType?.toLowerCase() === "visit"
    );
  }

  // 📅 TODAY'S BOOKINGS
  if (activeTab === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= today;
    });
  }

  // ⭐⭐ FINAL RENDER WRAPPED INSIDE LAYOUT ⭐⭐
  return (
    <Layout>
      <div className="orders-page">

        <div className="service-header">
          <h1>Service Bookings</h1>
          <p>These bookings come from the GearGenie user app.</p>
        </div>

        {/* ⭐ TABS */}
        <div className="booking-tabs">
          <button
            className={activeTab === "all" ? "tab active" : "tab"}
            onClick={() => setActiveTab("all")}
          >
            All Bookings
          </button>

          <button
            className={activeTab === "today" ? "tab active" : "tab"}
            onClick={() => setActiveTab("today")}
          >
            Today
          </button>

          <button
            className={activeTab === "doorstep" ? "tab active" : "tab"}
            onClick={() => setActiveTab("doorstep")}
          >
            Doorstep Service
          </button>

          <button
            className={activeTab === "center" ? "tab active" : "tab"}
            onClick={() => setActiveTab("center")}
          >
            Service Centre Booking
          </button>
        </div>

        {/* ⭐ TABLE */}
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Issue</th>
              <th>Service Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((b, index) => (
              <tr key={b._id}>
                <td>{index + 1}</td>
                <td>{b.customerName}</td>
                <td>{b.issueType}</td>
                <td>{b.serviceType}</td>

                <td className={`status ${b.status}`}>{b.status}</td>

                <td>{b.createdAt?.substring(0, 10)}</td>

                <td className="actions-column">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/orders/${b._id}`)}
                  >
                    View
                  </button>

                  <button
                    className="btn-accept"
                    disabled={b.status === "accepted"}
                    onClick={() => updateStatus(b._id, "accepted")}
                  >
                    Accept
                  </button>

                  <button
                    className="btn-reject"
                    disabled={b.status === "rejected"}
                    onClick={() => updateStatus(b._id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No bookings found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </Layout>
  );
}

export default Orders;
