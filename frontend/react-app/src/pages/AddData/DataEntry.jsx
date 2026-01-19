import React from "react";
import logoImg from "../../assets/images/logo.jpeg";
import "../../styles/dashboard.css";

const DataEntry = () => {
  return (
    <div className="dashboard-container">
      <div className="header-section">
        <div className="mini-logo">
          <img src={logoImg} alt="logo" style={{ width: "100%" }} />
        </div>
        <h1 className="main-title">
          hjur ko aja ko <br /> karobar
        </h1>
      </div>

      <div className="form-box" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="data-flex">
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label>PRODUCT:</label>
              <input type="text" />
            </div>
            <div className="input-group">
              <label>MONEY:</label>
              <input type="number" />
            </div>
            <div className="input-group">
              <label>Inventory type:</label>
              <input type="text" />
            </div>
            <div className="input-group">
              <label>Date:</label>
              <input type="date" />
            </div>
          </div>

          <div className="text-white font-bold">or</div>

          <div style={{ flex: 1 }}>
            <div className="upload-box">
              <p>Upload your CSV</p>
              <input type="file" style={{ display: "none" }} id="csvUpload" />
              <label htmlFor="csvUpload" style={{ cursor: "pointer" }}>
                📁
              </label>
            </div>
          </div>
        </div>
        <button className="submit-btn">Continue</button>
      </div>
    </div>
  );
};

export default DataEntry;
