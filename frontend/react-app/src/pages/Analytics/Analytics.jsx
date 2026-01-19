import React from "react";
import "../../styles/dashboard.css";

const Analytics = () => {
  return (
    <div className="dashboard-container">
      {/* Main Analytics Box - Everything is now inside this container */}
      <div className="form-box analytics-large-box">
        {/* Top Section: Filter and KPI Summary */}
        <div className="analytics-top-row">
          <div className="input-group select-wrapper">
            <label>View Report By:</label>
            <select className="sahu-select">
              <option>Weekly Report</option>
              <option>Monthly Report</option>
              <option>Product Wise</option>
            </select>
          </div>

          <div className="kpi-mini-box">
            <div className="kpi-item">
              <label>TOTAL SALES</label>
              <div className="kpi-value">Rs. 85,400</div>
            </div>
            <div className="kpi-item">
              <label>PROFIT</label>
              <div className="kpi-value profit-green">Rs. 12,200</div>
            </div>
          </div>
        </div>

        {/* The Graph Area - Matches the white box style from your reference */}
        <div className="chart-container-white">
          <label className="chart-label">SALES TREND GRAPH</label>
          <div className="visual-chart">
            {/* This area represents the graph visualized in your design */}
            <div className="chart-line-placeholder"></div>
          </div>
        </div>

        {/* Enhanced Insight Section */}
        <div className="insight-grid">
          <div className="suggestion-bar sahu-alert">
            <label>SMART SUGGESTION</label>
            <p>YO X PRODUCT RAMRO SELL BHAKO CHA!!</p>
          </div>

          <div className="inventory-status">
            <label>STOCK ALERTS</label>
            <ul>
              <li>⚠️ Sugar is running low</li>
              <li>✅ Rice is fully stocked</li>
            </ul>
          </div>
        </div>

        {/* Button is now inside the container to match original design flow */}
        <div className="button-footer">
          <button className="submit-btn sahu-btn-big">CONTINUE</button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
