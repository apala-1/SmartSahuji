import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoImg from "../../assets/images/logo.jpeg";
import "./UserNavbar.css";

function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="user-nav">
      {/* Brand Section */}
      <div className="user-nav-logo" onClick={() => navigate("/dashboard")}>
        <div className="logo-container">
          <img src={logoImg} alt="SahuJi Logo" className="user-nav-img" />
          <div className="logo-badge">SS</div>
        </div>
        <div className="brand-text">
          <span className="brand-name">Smart</span>
          <span className="brand-highlight">SahuJi</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="user-nav-links">
        <Link
          to="/data-entry"
          className={`nav-link ${isActive("/data-entry") ? "active" : ""}`}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">Sales Entry</span>
        </Link>
        <Link
          to="/sales"
          className={`nav-link ${isActive("/sales") ? "active" : ""}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">History</span>
        </Link>
        <Link
          to="/analytics"
          className={`nav-link ${isActive("/analytics") ? "active" : ""}`}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-text">Analytics</span>
        </Link>
        <Link
          to="/inventory"
          className={`nav-link ${isActive("/inventory") ? "active" : ""}`}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-text">Inventory</span>
        </Link>

        <div className="nav-divider"></div>

        <div className="user-actions">
          <Link to="/profile" className="profile-link" title="Profile">
            <div className="user-avatar">
              <span>S</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;
