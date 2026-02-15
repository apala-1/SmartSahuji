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
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side - Logo & Brand */}
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => navigate("/dashboard")}>
            <img src={logoImg} alt="Logo" className="logo-img" />
            <div className="logo-text">
              <span className="brand-main">Smart</span>
              <span className="brand-sub">Sahuji</span>
            </div>
          </div>
        </div>

        {/* Right Side - Navigation, Profile & Logout */}
        <div className="navbar-right">
          <div className="navbar-nav">
            <Link
              to="/data-entry"
              className={`nav-link ${isActive("/data-entry") ? "active" : ""}`}
            >
              <span className="nav-label">Sales Entry</span>
            </Link>
            <Link
              to="/sales"
              className={`nav-link ${isActive("/sales") ? "active" : ""}`}
            >
              <span className="nav-label">Sales History</span>
            </Link>
            <Link
              to="/analytics"
              className={`nav-link ${isActive("/analytics") ? "active" : ""}`}
            >
              <span className="nav-label"> Sales Analytics</span>
            </Link>
            <Link
              to="/inventory"
              className={`nav-link ${isActive("/inventory") ? "active" : ""}`}
            >
              <span className="nav-label">Inventory</span>
            </Link>
          </div>

          <Link to="/profile" className="profile-btn">
            <div className="avatar">S</div>
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;
