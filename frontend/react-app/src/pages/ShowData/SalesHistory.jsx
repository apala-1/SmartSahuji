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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sales data");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSales(data);
        } else {
          setSales([]);
        }
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setSales([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const filteredSales =
    filter === "All" ? sales : sales.filter((s) => s.item_type === filter);

  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="main-content">
          <h2>Sales Ledger</h2>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <UserNavbar />
        <div className="main-content">
          <h2>Sales Ledger</h2>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="main-content">
        <h2>Sales Ledger</h2>

        <div className="filter-bar">
          <label>Filter by Type: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>

        <button className="analyze-btn" onClick={() => navigate("/analytics")}>
          Analyze Data
        </button>

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
            {Array.isArray(filteredSales) &&
              filteredSales.map((s) => (
                <tr key={s._id}>
                  <td>{s.product_name}</td>
                  <td>{s.barcode || "-"}</td>
                  <td>{s.category}</td>
                  <td>{s.item_type}</td>
                  <td>{s.sale_type || "-"}</td>
                  <td>{s.price}</td>
                  <td>{s.cost}</td>
                  <td>{s.quantity}</td>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
