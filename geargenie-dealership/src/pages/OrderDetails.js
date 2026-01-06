import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  const [aiSummary, setAiSummary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`/api/bookings/${id}`);

        setBooking(res.data.booking);
        setAiSummary(res.data.booking.aiSummary || "");
      } catch (err) {
        console.error("Error fetching booking details:", err);
      }
    };

    fetchBooking();
  }, [id]);

  const generateSummary = async () => {
    if (loadingAI) return;
    setLoadingAI(true);

    try {
      const res = await axios.post(`/api/bookings/${id}/ai-summary`);

      setAiSummary(res.data.aiSummary);
      setBooking((prev) => ({ ...prev, aiSummary: res.data.aiSummary }));
    } catch (err) {
      console.error("AI Summary Error:", err);
    }

    setLoadingAI(false);
  };

  if (!booking)
    return <h2 className="loading">Loading Booking Details...</h2>;

  return (
    <div className="order-page">
      <h1 className="title">Booking Details</h1>

      {/* ⭐ MAIN BOOKING INFO GRID ⭐ */}
      <div className="booking-grid">
        <div className="booking-item">
          <span className="key">Customer:</span>
          <span className="value">{booking.customerName}</span>
        </div>
        <div className="booking-item">
          <span className="key">Phone:</span>
          <span className="value">{booking.phone}</span>
        </div>
        <div className="booking-item">
          <span className="key">Issue Type:</span>
          <span className="value">{booking.issueType}</span>
        </div>
        <div className="booking-item">
          <span className="key">Service Type:</span>
          <span className="value">{booking.serviceType}</span>
        </div>
        <div className="booking-item">
          <span className="key">Centre Name:</span>
          <span className="value">{booking.centreName}</span>
        </div>
        <div className="booking-item">
          <span className="key">Status:</span>
          <span className="value">{booking.status}</span>
        </div>
        <div className="booking-item">
          <span className="key">Preferred Date:</span>
          <span className="value">{booking.preferredDate}</span>
        </div>
        <div className="booking-item">
          <span className="key">Preferred Time:</span>
          <span className="value">{booking.preferredTime}</span>
        </div>
        <div className="booking-item">
          <span className="key">Created On:</span>
          <span className="value">{booking.createdAt?.substring(0, 10)}</span>
        </div>

        {booking.location?.address && (
          <div className="booking-item">
            <span className="key">Location:</span>
            <span className="value">{booking.location.address}</span>
          </div>
        )}
      </div>

      {/* ⭐ AI MECHANIC SUMMARY ⭐ */}
      <div className="summary-card">
  <h2 className="summary-title">AI Mechanic Summary</h2>

  <div className="summary-box">
    {aiSummary ? (
      <div
        className="summary-text"
        dangerouslySetInnerHTML={{
          __html: aiSummary
            .replace(/\*\*(.*?)\*\*/g, "<span class='ai-heading'>$1</span>")
            .replace(/- /g, "• ")
        }}
      ></div>
    ) : (
      <p className="no-summary">No AI analysis available for this booking.</p>
    )}
  </div>

  <button
    className="ai-btn"
    onClick={generateSummary}
    disabled={loadingAI}
  >
    {loadingAI ? "Generating..." : "Generate AI Summary"}
  </button>
</div>

      {/* ⭐ OBD DATA SECTION ⭐ */}
      {booking.obdData && Object.keys(booking.obdData).length > 0 && (
        <div className="obd-section">
          <h2 className="obd-title">OBD Data</h2>

          <div className="obd-card">
            <div className="obd-grid">
              {Object.entries(booking.obdData)
                .filter(([key]) => !["id", "label", "__v", "createdAt"].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="obd-item">
                    <span className="obd-key">
                      {key.replace(/_/g, " ").toUpperCase()}:
                    </span>
                    <span className="obd-value">{value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ⭐ UPDATED CENTERED BACK BUTTON ⭐ */}
      <div className="back-btn-wrapper">
        <button className="back-btn2" onClick={() => window.history.back()}>
  Go Back
</button>

      </div>
    </div>
  );
}

export default OrderDetails;
