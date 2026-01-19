import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../assets/images/logo.jpeg";
import "./UserNavbar.css";

function UserNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="user-nav">
      {/* Brand Section */}
      <div className="user-nav-logo" onClick={() => navigate("/dashboard")}>
        <img src={logoImg} alt="SahuJi Logo" className="user-nav-img" />
        <span className="user-nav-text">
          smart <span className="highlight-text">SahuJi</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div className="user-nav-links">
        <Link to="/data-entry" className="user-nav-item">
          Sales Entry
        </Link>
        <Link to="/analytics" className="user-nav-item">
          Analytics
        </Link>
        <Link to="/inventory" className="user-nav-item">
          Inventory
        </Link>

        {/* NEW LINK ADDED HERE */}
        <Link to="/sales" className="user-nav-item">
          Sales History
        </Link>

        <div className="user-profile-section">
          <div className="user-avatar-circle">S</div>
          <Link
            to="/login"
            className="user-logout-btn"
            onClick={() => {
              localStorage.removeItem("token"); // remove token
            }}
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;
