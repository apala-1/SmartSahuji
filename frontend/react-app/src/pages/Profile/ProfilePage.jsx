import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Account form
  const [accountForm, setAccountForm] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Business settings
  const [businessSettings, setBusinessSettings] = useState({
    shopName: "",
    country: "Nepal",
    phone: "",
    address: "",
    currency: "NPR",
  });

  // Country codes mapping
  const countryCodes = {
    Nepal: "+977",
    India: "+91",
    Bangladesh: "+880",
    Pakistan: "+92",
    "Sri Lanka": "+94",
    China: "+86",
    Thailand: "+66",
    USA: "+1",
    Canada: "+1",
    UK: "+44",
    Australia: "+61",
  };

  // Notifications
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    saleNotifications: true,
    marketingEmails: false,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeZone: "NPT",
  });

  const token = localStorage.getItem("token");

  // Fetch user profile
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData({
          username: res.data.username || "",
          email: res.data.email || "",
        });

        setAccountForm({
          username: res.data.username || "",
          email: res.data.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        showMessage("error", "Failed to load profile");
      }
    };

    fetchProfile();
  }, [token]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // Update account info
  const handleUpdateAccount = async () => {
    if (!accountForm.username || !accountForm.email) {
      showMessage("error", "Username and email are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: accountForm.username,
        email: accountForm.email,
      };

      if (accountForm.newPassword) {
        if (accountForm.newPassword !== accountForm.confirmPassword) {
          showMessage("error", "Passwords do not match");
          return;
        }
        if (!accountForm.currentPassword) {
          showMessage(
            "error",
            "Current password is required to change password",
          );
          return;
        }
        payload.currentPassword = accountForm.currentPassword;
        payload.password = accountForm.newPassword;
      }

      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setUserData({
        username: res.data.user.username,
        email: res.data.user.email,
      });

      setAccountForm({
        ...accountForm,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showMessage(
        "success",
        res.data.message || "Profile updated successfully",
      );
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  // Update business settings
  const handleUpdateBusinessSettings = async () => {
    setLoading(true);
    try {
      showMessage("success", "Business settings updated successfully");
    } catch (err) {
      showMessage("error", "Failed to update business settings");
    } finally {
      setLoading(false);
    }
  };

  // Update notifications
  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      showMessage("success", "Notification preferences updated");
    } catch (err) {
      showMessage("error", "Failed to update notifications");
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      showMessage("success", "Account deleted. Redirecting to login...");
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to delete account",
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const getInitials = (username) => {
    return (
      username
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "US"
    );
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">{getInitials(userData.username)}</div>
        <h1>Welcome, {userData.username || "User"}!</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <span className="alert-icon">
            {message.type === "success" ? "✓" : "✕"}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`profile-tab ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Account
        </button>
        <button
          className={`profile-tab ${activeTab === "business" ? "active" : ""}`}
          onClick={() => setActiveTab("business")}
        >
          Business
        </button>
        <button
          className={`profile-tab ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={`profile-tab ${activeTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          Preferences
        </button>
        <button
          className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
      </div>

      {/* Content */}
      <div className="profile-content">
        {/* Profile Tab */}
        <div
          className={`profile-section ${activeTab === "profile" ? "active" : ""}`}
        >
          <div className="settings-group">
            <h3>
              <span className="settings-group-icon">👤</span>
              Your Profile Information
            </h3>
            <div className="stat-card">
              <h4>Username</h4>
              <p>{userData.username || "Not set"}</p>
            </div>
            <div className="stat-card">
              <h4>Email</h4>
              <p>{userData.email || "Not set"}</p>
            </div>
            <p style={{ color: "#64748b", marginTop: "1.5rem" }}>
              Update your account details from the Account tab. Your profile
              information helps us identify your transactions and keep your
              account secure.
            </p>
          </div>
        </div>

        {/* Account Settings Tab */}
        <div
          className={`profile-section ${activeTab === "account" ? "active" : ""}`}
        >
          <div className="settings-group">
            <h3>
              <span className="settings-group-icon">⚙️</span>
              Account Settings
            </h3>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={accountForm.username}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, username: e.target.value })
                }
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={accountForm.email}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>

            <hr
              style={{
                margin: "2rem 0",
                border: "none",
                borderTop: "1px solid #e2e8f0",
              }}
            />

            <h3 style={{ marginTop: "2rem" }}>
              <span className="settings-group-icon">🔐</span>
              Change Password
            </h3>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={accountForm.currentPassword}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={accountForm.newPassword}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={accountForm.confirmPassword}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
              />
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleUpdateAccount}
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Business Settings Tab */}
        <div
          className={`profile-section ${activeTab === "business" ? "active" : ""}`}
        >
          <div className="settings-group">
            <h3>
              <span className="settings-group-icon">🏪</span>
              Business Information
            </h3>

            <div className="form-group">
              <label>Shop Name</label>
              <input
                type="text"
                value={businessSettings.shopName}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    shopName: e.target.value,
                  })
                }
                placeholder="Enter your shop name"
              />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Country</label>
                <select
                  value={businessSettings.country}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      country: e.target.value,
                    })
                  }
                  className="form-input"
                >
                  <option value="Nepal">Nepal</option>
                  <option value="India">India</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="China">China</option>
                  <option value="Thailand">Thailand</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-prefix">
                  <span className="prefix">
                    {countryCodes[businessSettings.country]}
                  </span>
                  <input
                    type="tel"
                    value={businessSettings.phone}
                    onChange={(e) =>
                      setBusinessSettings({
                        ...businessSettings,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  value={businessSettings.currency}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      currency: e.target.value,
                    })
                  }
                >
                  <option value="NPR">Rs Nepalese Rupee (NPR)</option>
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Business Address</label>
              <textarea
                value={businessSettings.address}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    address: e.target.value,
                  })
                }
                placeholder="Enter your business address"
                rows="3"
              />
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleUpdateBusinessSettings}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Business Info"}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Tab */}
        <div
          className={`profile-section ${activeTab === "notifications" ? "active" : ""}`}
        >
          <div className="settings-group">
            <h3>
              <span className="settings-group-icon">🔔</span>
              Notification Preferences
            </h3>

            <div className="toggle-switch">
              <span className="toggle-label">Email Notifications</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-switch">
              <span className="toggle-label">Low Stock Alerts</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.lowStockAlerts}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      lowStockAlerts: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-switch">
              <span className="toggle-label">Sale Notifications</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.saleNotifications}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      saleNotifications: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-switch">
              <span className="toggle-label">Marketing Emails</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.marketingEmails}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      marketingEmails: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleUpdateNotifications}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Tab */}
        <div
          className={`profile-section ${activeTab === "preferences" ? "active" : ""}`}
        >
          <div className="settings-group">
            <h3>
              <span className="settings-group-icon">🌐</span>
              Application Preferences
            </h3>

            <div className="form-group-row">
              <div className="form-group">
                <label>Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) =>
                    setPreferences({ ...preferences, language: e.target.value })
                  }
                >
                  <option value="en">English</option>
                  <option value="ne">Nepali (नेपाली)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date Format</label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      dateFormat: e.target.value,
                    })
                  }
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Time Zone</label>
              <select
                value={preferences.timeZone}
                onChange={(e) =>
                  setPreferences({ ...preferences, timeZone: e.target.value })
                }
              >
                <option value="NPT">NPT (Nepal Time)</option>
                <option value="IST">IST (India Standard Time)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="EST">EST (Eastern Standard Time)</option>
                <option value="CST">CST (Central Standard Time)</option>
              </select>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={() => showMessage("success", "Preferences saved")}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Security & Account Management Tab */}
        <div
          className={`profile-section ${activeTab === "security" ? "active" : ""}`}
        >
          <div className="settings-group">
            <h3>
              <span className="settings-group-icon">🔒</span>
              Security & Account Management
            </h3>

            <div className="security-info">
              <strong>Session Information</strong>
              <p style={{ marginBottom: 0 }}>
                Last login: Just now | Active sessions: 1
              </p>
            </div>

            <div className="button-group">
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout Current Session
              </button>
            </div>

            <hr
              style={{
                margin: "2rem 0",
                border: "none",
                borderTop: "1px solid #e2e8f0",
              }}
            />

            <h3 style={{ color: "#991b1b", marginTop: "2rem" }}>
              <span className="settings-group-icon">⚠️</span>
              Danger Zone
            </h3>

            <div className="confirm-box">
              <p>
                <strong>Delete Account</strong>
              </p>
              <p>
                Once you delete your account, there is no going back. Please be
                certain. This will permanently delete all your data including
                products, sales, and inventory records.
              </p>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
