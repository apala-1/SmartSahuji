import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login/authstyle.css";
import axios from "axios";
import logoImg from "../../assets/images/logo.jpeg";

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateInputs = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim() || !rePassword.trim()) {
      setError("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    const phoneRegex = /^[0-9]{10,15}$/; // adjust length as needed
    if (!phoneRegex.test(phone)) {
      setError("Phone number must be 10-15 digits");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== rePassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    setError("");
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: fullName,
        email,
        phone,
        password,
      });

      alert("Sign up successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Sign up failed");
    } finally {
      setLoading(false);
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
          <h2 className="form-title">Sign Up</h2>

          {error && <p className="error-text">{error}</p>}

          <div className="input-group">
            <label>Full Name:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Phone Number:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Re-Password:</label>
            <input
              type="password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
            />
          </div>

          <button
            className="submit-btn"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
