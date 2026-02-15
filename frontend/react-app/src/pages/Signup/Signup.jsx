import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Login/authstyle.css";
import axios from "axios";
import logoImg from "../../assets/images/logo.jpeg";

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+977"); // Default to Nepal
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const countryCodes = {
    Nepal: "+977",
    India: "+91",
    Bangladesh: "+880",
    Pakistan: "+92",
    "Sri Lanka": "+94",
    China: "+86",
    USA: "+1",
    UK: "+44",
    Australia: "+61",
    Japan: "+81",
    "South Korea": "+82",
  };

  const validateInputs = () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !rePassword.trim()
    ) {
      setError("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      setError("Phone number must be 7-15 digits");
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
    setSuccess("");
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const fullPhoneNumber = `${countryCode}${phone}`;
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: fullName,
        email,
        phone: fullPhoneNumber,
        password,
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Sign up failed",
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
              <Link to="/login">Login</Link>
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
            <h2 className="form-title">Create your account for free!</h2>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Country</label>
              <select
                value={Object.keys(countryCodes).find(
                  (key) => countryCodes[key] === countryCode,
                )}
                onChange={(e) => setCountryCode(countryCodes[e.target.value])}
                disabled={loading}
              >
                {Object.keys(countryCodes).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <div className="phone-input-group">
                <input
                  type="text"
                  value={countryCode}
                  readOnly
                  disabled={loading}
                  className="phone-prefix"
                />
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                  className="phone-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" defaultChecked />
              <label htmlFor="terms">
                Creating an account means you're okay with our{" "}
                <a href="#">Terms of Service</a> &{" "}
                <a href="#">Privacy Policy</a>.
              </label>
            </div>

            <button
              className="submit-btn"
              onClick={handleSignUp}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="bottom-link">
              Already have an account?{" "}
              <Link to="/login" className="link-text">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
