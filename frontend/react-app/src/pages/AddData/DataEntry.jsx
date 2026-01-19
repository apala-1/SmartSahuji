import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import UserNavbar from "../../components/Navbar/UserNavbar";

const DataEntry = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    product: "",
    category: "",
    price: "",
    saleType: "Retail Sale",
    date: ""
  });

  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("Please log in first!");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.product || !form.category || !form.price || !form.date) {
      alert("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product: form.product,
          category: form.category,
          type: form.saleType,
          price: Number(form.price),
          date: form.date
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error saving:", data);
        alert(data.error || "Failed to save sale");
        return;
      }

      console.log("Saved:", data);
      alert("Sale saved successfully");

      setForm({
        product: "",
        category: "",
        price: "",
        saleType: "Retail Sale",
        date: ""
      });
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save sale");
    }
  };

  return (
    <div className="page-wrapper">
      <UserNavbar />

      <main className="main-content">
        <div className="full-page-entry">
          <div className="entry-container wide-container">
            <div className="entry-header">
              <h2>Sales Ledger Entry</h2>
              <p>Organize your transactions by category and product type.</p>
            </div>

            <div className="entry-grid spaced-grid">
              {/* Left Side */}
              <div className="manual-section">
                <h3 className="section-subtitle">Individual Sale</h3>

                <div className="input-row spaced-row">
                  <div className="input-group">
                    <label>PRODUCT NAME</label>
                    <input
                      type="text"
                      name="product"
                      placeholder="e.g., Samsung Galaxy"
                      value={form.product}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label>PRODUCT CATEGORY</label>
                    <select
                      className="form-select"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option>Electronics</option>
                      <option>Groceries & Food</option>
                      <option>Clothing & Apparel</option>
                      <option>Hardware</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-row spaced-row">
                  <div className="input-group">
                    <label>MONEY RECEIVED (Rs.)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label>SALE TYPE</label>
                    <select
                      className="form-select"
                      name="saleType"
                      value={form.saleType}
                      onChange={handleChange}
                    >
                      <option>Retail Sale</option>
                      <option>Wholesale</option>
                      <option>Credit (Udhari)</option>
                      <option>Online Order</option>
                    </select>
                  </div>
                </div>

                <div className="input-row spaced-row">
                  <div className="input-group">
                    <label>TRANSACTION DATE</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group" style={{ visibility: "hidden" }} />
                </div>

                <button className="save-record-btn" onClick={handleSubmit}>
                  SAVE DATA
                </button>
              </div>

              {/* Divider */}
              <div className="vertical-divider">
                <span>OR</span>
              </div>

              {/* Right Side */}
              <div className="upload-section">
                <h3 className="section-subtitle">Bulk Import</h3>
                <div className="upload-card extra-padding">
                  <div className="upload-icon">📄</div>
                  <h4>Upload Ledger File</h4>
                  <p>Drag and drop your .csv or .xlsx file here</p>

                  <input type="file" style={{ display: "none" }} id="csvUpload" />
                  <label htmlFor="csvUpload" className="professional-upload-btn">
                    CHOOSE FILE
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataEntry;
