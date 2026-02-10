// src/pages/Profile/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const token = localStorage.getItem("token");
  console.log(`Token: `, token);
  useEffect(() => {
    // Fetch profile on mount
    axios
      .get("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setForm({
          username: res.data.username,
          email: res.data.email,
          password: "",
        });
      })
      .catch((err) => console.error(err));
  }, [token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = () => {
    axios
      .put("/api/auth/profile", form, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        alert(res.data.message);
        setForm({
          username: res.data.user.username,
          email: res.data.user.email,
          password: "",
        });
      })
      .catch((err) => alert(err.response?.data?.error || err.message));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure? This cannot be undone!")) {
      axios
        .delete("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          alert("Profile deleted");
          localStorage.removeItem("token");
          window.location.href = "/login";
        })
        .catch((err) => alert(err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}>
      <h2>Welcome, {form.username || "User"}!</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="New Password"
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <button
        onClick={handleUpdate}
        style={{ padding: "0.5rem 1rem", marginRight: "1rem" }}
      >
        Update Profile
      </button>
      <button
        onClick={handleDelete}
        style={{ padding: "0.5rem 1rem", color: "white", background: "red" }}
      >
        Delete Profile
      </button>
    </div>
  );
};

export default ProfilePage;
