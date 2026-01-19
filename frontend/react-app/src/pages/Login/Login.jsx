import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login/authstyle.css";
import axios from "axios";
import logoImg from "../../assets/images/logo.jpeg";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      // Save token for protected routes
      localStorage.setItem("token", res.data.token);

      alert("Login successful!");
      navigate("/dashboard"); // redirect to dashboard after login
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Login failed");
    }
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
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Password :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
          <button className="submit-btn" onClick={handleLogin}>
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
