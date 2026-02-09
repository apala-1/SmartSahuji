import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login/authstyle.css";
import axios from "axios";
import logoImg from "../../assets/images/logo.jpeg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Login failed");
    }
  };

  // ... imports stay same

  return (
    <div className="auth-container">
      <div className="branding-side">
        <h2 className="welcome-text">WELCOME TO</h2>
        <div className="logo-circle">
          <img src={logoImg} alt="SahuJi" />
        </div>
      </div>

      <div className="form-side" style={{ backgroundColor: "#555" }}>
        {" "}
        {/* Dark grey used here for contrast since orange is removed */}
        <div className="form-box">
          <div className="form-container-inner">
            <div className="input-group">
              <label>Username :</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <Link to="/forgot-password" hidden className="forget-pass">
                Forgot Password?
              </Link>
            </div>

            <div className="button-row">
              <button
                className="new-user-btn"
                onClick={() => navigate("/signup")}
              >
                New User?
              </button>
              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
