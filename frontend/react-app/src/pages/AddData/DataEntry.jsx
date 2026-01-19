import React from "react";
import "../../styles/dashboard.css";
import UserNavbar from "../../components/Navbar/UserNavbar";

const DataEntry = () => {
  return (
    <div className="page-wrapper">
      {/* Only one Navbar here */}
      <UserNavbar />
      <main className="main-content">
        <div className="full-page-entry">
          <div className="entry-container wide-container">
            <div className="entry-header">
              <h2>Sales Ledger Entry</h2>
              <p>Organize your transactions by category and product type.</p>
            </div>

            <div className="entry-grid spaced-grid">
              {/* Left Side: Manual Sales Form */}
              <div className="manual-section">
                <h3 className="section-subtitle">Individual Sale</h3>

                <div className="input-row spaced-row">
                  <div className="input-group">
                    <label>PRODUCT NAME</label>
                    <input type="text" placeholder="e.g., Samsung Galaxy" />
                  </div>
                  <div className="input-group">
                    <label>PRODUCT CATEGORY</label>
                    <select className="form-select">
                      <option value="">Select Category</option>
                      <option>Electronics</option>
                      <option>Groceries & Food</option>
                      <option>Clothing & Apparel</option>
                      <option>Hardware</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-row spaced-row">
                  <div className="input-group">
                    <label>MONEY RECEIVED (Rs.)</label>
                    <input type="number" placeholder="0.00" />
                  </div>
                  <div className="input-group">
                    <label>SALE TYPE</label>
                    <select className="form-select">
                      <option>Retail Sale</option>
                      <option>Wholesale</option>
                      <option>Credit (Udhari)</option>
                      <option>Online Order</option>
                    </select>
                  </div>
                </div>

                <div className="input-row spaced-row">
                  <div className="input-group">
                    <label>TRANSACTION DATE</label>
                    <input type="date" />
                  </div>
                  <div className="input-group" style={{ visibility: "hidden" }}>
                    {/* Placeholder for balance */}
                  </div>
                </div>

                <button className="save-record-btn">SAVE DATA</button>
              </div>

              {/* Divider */}
              <div className="vertical-divider">
                <span>OR</span>
              </div>

              {/* Right Side: Professional Bulk Upload */}
              <div className="upload-section">
                <h3 className="section-subtitle">Bulk Import</h3>
                <div className="upload-card extra-padding">
                  <div className="upload-icon">📄</div>
                  <h4>Upload Ledger File</h4>
                  <p>Drag and drop your .csv or .xlsx file here</p>

                  <input
                    type="file"
                    style={{ display: "none" }}
                    id="csvUpload"
                  />
                  <label
                    htmlFor="csvUpload"
                    className="professional-upload-btn"
                  >
                    CHOOSE FILE
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataEntry;
