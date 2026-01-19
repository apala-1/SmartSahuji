import React from "react";
import { Link, useNavigate } from "react-router-dom"; // 1. Added useNavigate
import "../Login/authstyle.css";
import logoImg from "../../assets/images/logo.jpeg";

const LoginPage = () => {
  const navigate = useNavigate(); // 2. Initialize navigate

  const handleLogin = () => {
    // In a real app, you would verify the username/password here.
    // For now, we redirect immediately to the dashboard.
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="branding-side">
        <h2 className="welcome-text">WELCOME TO</h2>
        <div className="logo-circle">
          <img src={logoImg} alt="SahuJi" />
        </div>
        <h1 className="brand-name">
          <span className="smart">smart</span>{" "}
          <span className="sahuji">SahuJi</span>
        </h1>
      </div>

      <div className="form-side">
        <div className="form-box">
          <h2 className="form-title">Login</h2>
          <div className="input-group">
            <label>Username :</label>
            <input type="text" placeholder="Enter username" />
          </div>
          <div className="input-group">
            <label>Password :</label>
            <input type="password" placeholder="Enter password" />
          </div>
          <div className="form-footer">
            <Link to="/signup">
              <button className="new-user-btn">NEW USER?</button>
            </Link>
            <Link
              to="/forgot-password"
              title="Forgot Password"
              className="forget-pass"
            >
              FORGET PASSWORD?
            </Link>
          </div>
          {/* 3. Added onClick to trigger the redirect */}
          <button className="submit-btn" onClick={handleLogin}>
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
