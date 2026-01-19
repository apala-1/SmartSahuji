import React, { useState } from "react";
import "../../styles/dashboard.css";

const SalesDataEntry = () => {
  // 15 rows for high-volume sales entry
  const [salesRows, setSalesRows] = useState(Array(15).fill({}));

  return (
    <div className="excel-page-container">
      {/* Clean Ribbon Toolbar */}
      <div className="excel-menu-bar">
        <div className="menu-item active">Sales Ledger</div>
        <div className="menu-item">View History</div>
        <div className="menu-item">Print Receipt</div>
        <div className="excel-filename">Daily_Sales_Tracker.xlsx</div>
      </div>

      <div className="excel-spreadsheet-area">
        <table className="excel-main-grid">
          <thead>
            <tr>
              <th className="excel-index-col"></th>
              <th className="excel-header-col">A (CUSTOMER NAME)</th>
              <th className="excel-header-col">B (PRODUCT SOLD)</th>
              <th className="excel-header-col">C (QTY)</th>
              <th className="excel-header-col">D (TOTAL MONEY)</th>
              <th className="excel-header-col">E (DATE)</th>
              <th className="excel-header-col">F (PAYMENT METHOD)</th>
            </tr>
          </thead>
          <tbody>
            {salesRows.map((_, index) => (
              <tr key={index}>
                <td className="excel-index-cell">{index + 1}</td>
                <td>
                  <input
                    type="text"
                    className="excel-input"
                    placeholder="Guest Customer..."
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="excel-input"
                    placeholder="Product..."
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="excel-input"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="excel-input"
                    placeholder="0.00"
                  />
                </td>
                <td>
                  <input type="date" className="excel-input" />
                </td>
                <td>
                  <select className="excel-input excel-select">
                    <option value="cash">Cash</option>
                    <option value="qr">QR / Fonepay</option>
                    <option value="credit">Udhari (Credit)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Excel Bottom Function Bar */}
      <div className="excel-bottom-bar">
        <div className="sheet-tabs">
          <div className="tab active-tab">Sales_Entry</div>
          <div className="tab">Revenue_Summary</div>
        </div>
        <div className="excel-footer-actions">
          <button className="excel-btn-secondary">Clear Sheet</button>
          <button className="excel-btn-primary">RECORD SALES</button>
        </div>
      </div>
    </div>
  );
};

export default SalesDataEntry;
