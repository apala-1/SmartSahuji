import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/Navbar/UserNavbar";
import "./SalesHistory.css";

export default function SalesHistory() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();

    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/product", {
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
        if (Array.isArray(data)) setSales(data);
        else setSales([]);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setSales([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

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

        <button className="analyze-btn" onClick={() => navigate("/analytics")}>
          Analyze Data
        </button>

        <table className="excel-main-grid">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount (Rs)</th>
              <th>Cost (Rs)</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((s) => (
              <tr key={s._id}>
                <td>{s.product}</td>
                <td>{s.category}</td>
                <td>{s.type}</td>
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
