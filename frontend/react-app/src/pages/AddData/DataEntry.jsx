import React, { useState, useEffect } from "react";
import axios from "axios";

const categories = [
  "Electronics",
  "Groceries",
  "Clothing",
  "Accessories",
  "General",
];

export default function DataEntry() {
  const [form, setForm] = useState({
    product_name: "",
    barcode: "",
    category: "General",
    item_type: "Sale", // Sale or Purchase
    sale_type: "Retail",
    price: 0,
    cost: 0,
    quantity: 1,
    date: new Date().toISOString().slice(0, 10),
  });

  const [file, setFile] = useState(null);

  // Create axios instance directly here
  const API = axios.create({
    baseURL: "http://localhost:5000/api", // adjust if backend runs elsewhere
  });

  // Attach token if you’re using auth
  API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  // Autofill selling price from inventory when barcode or name changes
  useEffect(() => {
    const fetchInventory = async () => {
      if (!form.product_name && !form.barcode) return;
      try {
        const { data } = await API.get(
          `/inventory/autofill?query=${form.barcode || form.product_name}`,
        );
        if (data?.sellingPrice) {
          setForm((prev) => ({ ...prev, price: data.sellingPrice }));
        }
      } catch (err) {
        console.error("Autofill error:", err);
      }
    };
    fetchInventory();
  }, [form.product_name, form.barcode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/products", form);
      alert("Transaction saved successfully");
      setForm({
        product_name: "",
        barcode: "",
        category: "General",
        item_type: "Sale",
        sale_type: "Retail",
        price: 0,
        cost: 0,
        quantity: 1,
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving transaction");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await API.post("/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`${data.count} products uploaded successfully`);
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Bulk upload failed");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Product Entry</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="product_name"
          placeholder="Product Name"
          value={form.product_name}
          onChange={handleChange}
        />
        <input
          name="barcode"
          placeholder="Barcode"
          value={form.barcode}
          onChange={handleChange}
        />

        <select name="category" value={form.category} onChange={handleChange}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select name="item_type" value={form.item_type} onChange={handleChange}>
          <option value="Sale">Sale</option>
          <option value="Purchase">Purchase</option>
        </select>

        {form.item_type === "Sale" && (
          <>
            <input
              name="sale_type"
              placeholder="Sale Type"
              value={form.sale_type}
              onChange={handleChange}
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
            />
          </>
        )}

        {form.item_type === "Purchase" && (
          <input
            name="cost"
            type="number"
            placeholder="Cost"
            value={form.cost}
            onChange={handleChange}
          />
        )}

        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />

        <button type="submit">Save Transaction</button>
      </form>

      <h2>Bulk Upload</h2>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
