import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/Navbar/UserNavbar";
import "./SalesHistory.css";

export default function SalesHistory() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All"); // All, Sale, Purchase

  // Fetch sales data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    const fetchSales = async () => {
      try {
        const res = await fetch("/api/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch sales data");

        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [navigate]);

  // Filter sales based on selected type
  const filteredSales =
    filter === "All" ? sales : sales.filter((s) => s.item_type === filter);

  // Render loading state
  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="main-content">
          <h2>Sales Ledger</h2>
          <p>Loading sales data...</p>
        </div>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <UserNavbar />
        <div className="main-content">
          <h2>Sales Ledger</h2>
          <p className="error-text">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="main-content">
        <h2>Sales Ledger</h2>

        {/* Filter Dropdown */}
        <div className="filter-bar">
          <label htmlFor="filter">Filter by Type:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>

        {/* Analyze Button */}
        <button className="analyze-btn" onClick={() => navigate("/analytics")}>
          Analyze Data
        </button>

        {/* Table */}
        {filteredSales.length === 0 ? (
          <p>No {filter === "All" ? "" : filter} records found.</p>
        ) : (
          <table className="excel-main-grid">
            <thead>
              <tr>
                <th>Name</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Item Type</th>
                <th>Sale Type</th>
                <th>Selling (Rs)</th>
                <th>Buying (Rs)</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr key={s._id}>
                  <td>{s.product_name}</td>
                  <td>{s.barcode || "-"}</td>
                  <td>{s.category}</td>
                  <td>{s.item_type}</td>
                  <td>{s.sale_type || "-"}</td>
                  <td>{s.price || 0}</td>
                  <td>{s.cost || 0}</td>
                  <td>{s.quantity}</td>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
