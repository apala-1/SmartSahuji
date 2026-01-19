import React from "react";
import { useNavigate } from "react-router-dom"; // Useful for redirecting after sign up
import "../Login/authstyle.css";
// Import the logo from your images folder
import logoImg from "../../assets/images/logo.jpeg";

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    // Logic for sign up goes here
    navigate("/security"); // Redirect to security page after clicking sign up
  };

  return (
    <div className="auth-container">
      <div className="branding-side">
        <h2 className="welcome-text">WELCOME TO</h2>
        <div className="logo-circle">
          {/* Use the imported variable for the image */}
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
          <div className="input-group">
            <label>Full Name:</label>
            <input type="text" />
          </div>
          <div className="input-group">
            <label>Email :</label>
            <input type="email" />
          </div>
          <div className="input-group">
            <label>Phone Number:</label>
            <input type="text" />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input type="password" />
          </div>
          <div className="input-group">
            <label>Re-Password:</label>
            <input type="password" />
          </div>
          <button className="submit-btn" onClick={handleSignUp}>
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
