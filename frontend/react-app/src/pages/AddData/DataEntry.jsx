import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/DataEntry.css";
import UserNavbar from "../../components/Navbar/UserNavbar";

const DataEntry = () => {
  const navigate = useNavigate();

  const [transactionType, setTransactionType] = useState("sale");

  const [form, setForm] = useState({
    product: "",
    category: "",
    price: "",
    cost: "",
    quantity: 1,
    saleType: "Retail Sale",
    date: "",
  });

  const [file, setFile] = useState(null);

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
    if (!form.product || !form.category || !form.date) {
      alert("Please fill all required fields");
      return;
    }

    if (transactionType === "sale" && (!form.price || !form.quantity)) {
      alert("Please enter selling price and quantity");
      return;
    }

    if (transactionType === "purchase" && (!form.cost || !form.quantity)) {
      alert("Please enter buying cost and quantity");
      return;
    }

    const token = localStorage.getItem("token")?.trim();
    if (!token) return navigate("/login");

    try {
      const res = await fetch("http://localhost:5000/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionType, // sale or purchase
          product: form.product,
          category: form.category,
          price: transactionType === "sale" ? Number(form.price) : 0,
          cost: transactionType === "purchase" ? Number(form.cost) : 0,
          quantity: Number(form.quantity),
          saleType: transactionType === "sale" ? form.saleType : "Purchase",
          date: form.date,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Failed to save data");

      alert("Record saved successfully");
      setForm({
        product: "",
        category: "",
        price: "",
        cost: "",
        quantity: 1,
        saleType: "Retail Sale",
        date: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save record");
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!file) return alert("Please select a file first");
    const token = localStorage.getItem("token")?.trim();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/product/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Upload failed");

      alert(data.message || "File uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <main className="main-content">
          <div className="entry-container wide-container">
            <h2>Shop Ledger Entry</h2>
            <p>Record sales and purchases for your shop</p>

            {/* TRANSACTION TYPE */}
            <div className="input-row spaced-row">
              <div className="input-group">
                <label>TRANSACTION TYPE</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                >
                  <option value="sale">Sale (Money In)</option>
                  <option value="purchase">Purchase (Money Out)</option>
                </select>
              </div>
            </div>

            {/* PRODUCT INFO */}
            <div className="input-row spaced-row">
              <div className="input-group">
                <label>PRODUCT NAME</label>
                <input
                  type="text"
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>CATEGORY</label>
                <select
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

            {/* SALE FIELDS */}
            {transactionType === "sale" && (
              <div className="input-row spaced-row">
                <div className="input-group">
                  <label>SELLING PRICE (Rs.)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>SALE TYPE</label>
                  <select
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
            )}

            {/* PURCHASE FIELDS */}
            {transactionType === "purchase" && (
              <div className="input-row spaced-row">
                <div className="input-group">
                  <label>BUYING COST (Rs.)</label>
                  <input
                    type="number"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* COMMON */}
            <div className="input-row spaced-row">
              <div className="input-group">
                <label>QUANTITY</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>DATE</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="save-record-btn" onClick={handleSubmit}>
              SAVE RECORD
            </button>

            {/* BULK UPLOAD */}
            <hr />

            <h3>Bulk Import</h3>
            <input type="file" onChange={handleFileChange} />
            <button className="save-record-btn" onClick={handleFileUpload}>
              UPLOAD FILE
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default DataEntry;
