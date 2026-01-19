import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/Navbar/UserNavbar";
import './SalesHistory.css'

export default function SalesHistory() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);

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
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setSales(data);
        else setSales([]);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setSales([]);
      });
  }, [navigate]);

  return (
    <>
      <UserNavbar />
      <div className="main-content">
        <h2>Sales Ledger</h2>

        <table className="excel-main-grid">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount (Rs)</th>
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
                <td>{new Date(s.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
