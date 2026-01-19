import React from "react";
import logoImg from "../../assets/images/logo.jpeg";
import "../../styles/dashboard.css";

const Analytics = () => {
  return (
    <div className="dashboard-container">
      <div className="header-section">
        <div className="mini-logo">
          <img src={logoImg} alt="logo" style={{ width: "100%" }} />
        </div>
        <h1 className="main-title">Analytics Page</h1>
      </div>

      <div className="form-box" style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          className="input-group"
          style={{ display: "flex", alignItems: "center", gap: "20px" }}
        >
          <label style={{ whiteSpace: "nowrap" }}>Select Options:</label>
          <select
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          >
            <option>Weekly</option>
            <option>Monthly</option>
            <option>All products</option>
          </select>
        </div>

        <div className="chart-placeholder">
          {/* In a real app, place <LineChart /> here */}
          <img
            src="/sample-chart.png"
            alt="Analytics Graph"
            style={{ width: "100%" }}
          />
        </div>

        <div className="suggestion-bar">
          <p>Suggestion:</p>
          <p>YO X PRODUCT RAMRO SELL BHAKO CHA!!</p>
        </div>

        <button className="submit-btn" style={{ marginTop: "20px" }}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default Analytics;
