import React from "react";
import { Link } from "react-router-dom";
import "../Login/authstyle.css";
// 1. Import the logo here
import logoImg from "../../assets/images/logo.jpeg";

const LoginPage = () => {
  return (
    <div className="auth-container">
      <div className="branding-side">
        <h2 className="welcome-text">WELCOME TO</h2>
        <div className="logo-circle">
          {/* 2. Use the imported variable name */}
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
            <input type="text" />
          </div>
          <div className="input-group">
            <label>Password :</label>
            <input type="password" />
          </div>
          <div className="form-footer">
            <Link to="/signup">
              <button className="new-user-btn">NEW USER?</button>
            </Link>
            {/* Using a Link or Button fixes the ESLint warning */}
            <Link
              to="/forgot-password"
              title="Forgot Password"
              className="forget-pass"
            >
              FORGET PASSWORD?
            </Link>
          </div>
          <button className="submit-btn">LOGIN</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
