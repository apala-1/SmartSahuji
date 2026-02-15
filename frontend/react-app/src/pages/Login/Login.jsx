import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Login/authstyle.css";
import logoImg from "../../assets/images/logo.jpeg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setError("");
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.data?.token) {
        throw new Error("Token not received");
      }

      localStorage.setItem("token", response.data.token);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="branding-side">
          <div className="auth-header">
            <div className="logo-section">
              <div className="logo-icon">📊</div>
              <div className="logo-text">
                <strong>Smart SahuJi</strong>
                <small>BUSINESS PLATFORM</small>
              </div>
            </div>
            <nav className="auth-nav">
              <Link to="/">About Us</Link>
              <Link to="/">Prices</Link>
              <Link to="/">Contact</Link>
              <Link to="/signup">Register</Link>
            </nav>
          </div>

          <div className="logo-circle">
            <img src={logoImg} alt="SahuJi" />
          </div>
          <h1 className="brand-name">
            <span className="smart">smart</span>
            <span className="sahuji">SahuJi</span>
          </h1>
          <p className="brand-description">
            Discover the new way to manage your inventory, track sales, and grow
            your business efficiently.
          </p>
          <a href="#" className="see-more">
            See More
          </a>
        </div>

        <div className="form-side">
          <div className="form-box">
            <h2 className="form-title">Login to your account</h2>

            {error && <p className="error-text">{error}</p>}

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              className="submit-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>

            <p className="bottom-link">
              Don't have an account?{" "}
              <Link to="/signup" className="link-text">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
