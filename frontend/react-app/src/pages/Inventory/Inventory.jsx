import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import "../../styles/Inventory.css";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Refs for input navigation
  const searchInputRef = useRef(null);
  const productNameRef = useRef(null);
  const companyRef = useRef(null);
  const barcodeRef = useRef(null);
  const categoryRef = useRef(null);
  const buyingPriceRef = useRef(null);
  const sellingPriceRef = useRef(null);
  const quantityBoughtRef = useRef(null);
  const currentStockRef = useRef(null);
  const supplierNameRef = useRef(null);
  const supplierContactRef = useRef(null);
  const descriptionRef = useRef(null);

  const [form, setForm] = useState({
    _id: null,
    name: "",
    company: "",
    barcode: "",
    buyingPrice: "",
    sellingPrice: "",
    quantityBought: "",
    currentStock: "",
    category: "General",
    status: "Active",
    dateBought: "",
    description: "",
    supplierName: "",
    supplierContact: "",
  });

  /* =========================
     Axios instance
  ========================= */
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: "http://localhost:5000/api",
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return instance;
  }, []);

  /* =========================
     Fetch inventory
  ========================= */
  const fetchInventory = async () => {
    try {
      const res = await axiosInstance.get("/inventory");
      setInventory(res.data.inventory || []);
    } catch (err) {
      console.error("Fetch inventory error:", err);
      setInventory([]);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* =========================
     Handlers
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* =========================
     Autofill (barcode / name)
  ========================= */
  const handleAutofill = async (e) => {
    const query = e.target.value;
    if (!query) return;

    try {
      const res = await axiosInstance.get(`/inventory/autofill?query=${query}`);

      if (!res.data || !res.data.product_name) return;

      setForm((prev) => ({
        ...prev,
        name: res.data.product_name,
        company: res.data.company || "",
        buyingPrice: res.data.buyingPrice || "",
        sellingPrice: res.data.sellingPrice || "",
        currentStock: res.data.currentStock || "",
        category: res.data.category || "General",
      }));
    } catch (err) {
      console.error("Autofill error:", err);
    }
  };

  /* =========================
     Validation
  ========================= */
  const validateRequiredFields = () => {
    const required = {
      name: form.name?.trim(),
      buyingPrice: form.buyingPrice,
      quantityBought: form.quantityBought,
      currentStock: form.currentStock,
    };

    const missing = Object.entries(required)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      const fieldNames = missing
        .map((f) => f.replace(/([A-Z])/g, " $1").toLowerCase())
        .join(", ");
      setMessage({
        type: "error",
        text: `Please fill required fields: ${fieldNames}`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return false;
    }
    return true;
  };

  /* =========================
     Form keyboard navigation
  ========================= */
  const formFieldsOrder = [
    { ref: productNameRef, name: "name" },
    { ref: companyRef, name: "company" },
    { ref: barcodeRef, name: "barcode" },
    { ref: categoryRef, name: "category" },
    { ref: buyingPriceRef, name: "buyingPrice" },
    { ref: sellingPriceRef, name: "sellingPrice" },
    { ref: quantityBoughtRef, name: "quantityBought" },
    { ref: currentStockRef, name: "currentStock" },
    { ref: supplierNameRef, name: "supplierName" },
    { ref: supplierContactRef, name: "supplierContact" },
    { ref: descriptionRef, name: "description" },
  ];

  const handleFormKeyDown = (e, fieldName) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Find current field index
      const currentIndex = formFieldsOrder.findIndex(
        (f) => f.name === fieldName,
      );

      if (currentIndex === formFieldsOrder.length - 1) {
        // Last field - attempt to submit
        if (validateRequiredFields()) {
          handleSubmit(e);
        }
      } else {
        // Move to next field
        const nextField = formFieldsOrder[currentIndex + 1];
        setTimeout(() => nextField.ref.current?.focus(), 50);
      }
    }
  };

  /* =========================
     Add / Update inventory
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateRequiredFields()) return;

    const payload = {
      ...form,
      buyingPrice: Number(form.buyingPrice),
      sellingPrice: Number(form.sellingPrice),
      quantityBought: Number(form.quantityBought),
      currentStock: Number(form.currentStock),
    };

    try {
      if (form._id) {
        await axiosInstance.put(`/inventory/${form._id}`, payload);
        setMessage({ type: "success", text: "Inventory updated successfully" });
      } else {
        await axiosInstance.post("/inventory", payload);
        setMessage({ type: "success", text: "Inventory added successfully" });
      }

      resetForm();
      fetchInventory();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to save inventory",
      });
    }
  };

  const resetForm = () =>
    setForm({
      _id: null,
      name: "",
      company: "",
      barcode: "",
      buyingPrice: "",
      sellingPrice: "",
      quantityBought: "",
      currentStock: "",
      category: "General",
      status: "Active",
      dateBought: "",
      description: "",
      supplierName: "",
      supplierContact: "",
    });

  /* =========================
     Edit / Delete
  ========================= */
  const handleEdit = (item) => setForm({ ...item });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axiosInstance.delete(`/inventory/${id}`);
      setMessage({ type: "success", text: "Item deleted successfully" });
      fetchInventory();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete item" });
    }
  };

  /* =========================
     Search
  ========================= */
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.get(
        `/inventory/search?query=${searchQuery}`,
      );
      setInventory(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Perform search first
      handleSearch(e);
      // Clear search and move to product name field
      setTimeout(() => {
        setSearchQuery("");
        productNameRef.current?.focus();
      }, 300);
    }
  };

  /* =========================
     Export
  ========================= */
  const handleExport = async () => {
    try {
      const res = await axiosInstance.get("/inventory/export/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "inventory.xlsx";
      link.click();
    } catch {
      alert("Export failed");
    }
  };

  /* =========================
     Bulk upload
  ========================= */
  const handleBulkUpload = async () => {
    if (!file) return alert("Select a file");

    const fd = new FormData();
    fd.append("file", file);

    try {
      await axiosInstance.post("/inventory/upload/excel", fd);
      fetchInventory();
      setFile(null);
    } catch {
      alert("Bulk upload failed");
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <p className="inventory-subtitle">
          Track and manage your product inventory
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <span className="alert-icon">
            {message.type === "success" ? "✓" : "✕"}
          </span>
          <span className="alert-message">{message.text}</span>
          <button
            className="alert-close"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            ×
          </button>
        </div>
      )}

      <div className="inventory-toolbar">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, company, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="toolbar-actions">
          <button onClick={handleExport} className="btn btn-secondary">
            Export Excel
          </button>
          <div className="file-upload-wrapper">
            <input
              type="file"
              id="bulk-file"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input"
              accept=".xlsx,.csv"
            />
            <label htmlFor="bulk-file" className="file-label">
              {file ? file.name : "Choose File"}
            </label>
          </div>
          <button
            onClick={handleBulkUpload}
            className="btn btn-primary"
            disabled={!file}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      <form className="inventory-form">
        <div className="form-header">
          <h2>Add/Update Inventory</h2>
          <p className="form-subtitle">
            {form._id
              ? "Edit inventory item details"
              : "Add new products to inventory"}
          </p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              ref={productNameRef}
              name="name"
              placeholder="Enter product name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleAutofill}
              onKeyDown={(e) => handleFormKeyDown(e, "name")}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company</label>
            <input
              ref={companyRef}
              name="company"
              placeholder="Enter company name"
              value={form.company}
              onChange={handleChange}
              onKeyDown={(e) => handleFormKeyDown(e, "company")}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Barcode</label>
            <input
              ref={barcodeRef}
              name="barcode"
              placeholder="Enter barcode"
              value={form.barcode}
              onChange={handleChange}
              onBlur={handleAutofill}
              onKeyDown={(e) => handleFormKeyDown(e, "barcode")}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              ref={categoryRef}
              name="category"
              value={form.category}
              onChange={handleChange}
              onKeyDown={(e) => handleFormKeyDown(e, "category")}
              className="form-input"
            >
              <option>General</option>
              <option>Electronics</option>
              <option>Groceries</option>
              <option>Clothing</option>
              <option>Accessories</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Buying Price</label>
            <div className="input-with-prefix">
              <span className="prefix">₹</span>
              <input
                ref={buyingPriceRef}
                type="number"
                name="buyingPrice"
                placeholder="0.00"
                value={form.buyingPrice}
                onChange={handleChange}
                onKeyDown={(e) => handleFormKeyDown(e, "buyingPrice")}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Selling Price</label>
            <div className="input-with-prefix">
              <span className="prefix">₹</span>
              <input
                ref={sellingPriceRef}
                type="number"
                name="sellingPrice"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={handleChange}
                onKeyDown={(e) => handleFormKeyDown(e, "sellingPrice")}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Bought</label>
            <input
              ref={quantityBoughtRef}
              type="number"
              name="quantityBought"
              placeholder="0"
              value={form.quantityBought}
              onChange={handleChange}
              onKeyDown={(e) => handleFormKeyDown(e, "quantityBought")}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Stock</label>
            <input
              ref={currentStockRef}
              type="number"
              name="currentStock"
              placeholder="0"
              value={form.currentStock}
              onChange={handleChange}
              onKeyDown={(e) => handleFormKeyDown(e, "currentStock")}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supplier Name</label>
            <input
              ref={supplierNameRef}
              name="supplierName"
              placeholder="Enter supplier name"
              value={form.supplierName}
              onChange={handleChange}
              onKeyDown={(e) => handleFormKeyDown(e, "supplierName")}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supplier Contact</label>
            <input
              ref={supplierContactRef}
              name="supplierContact"
              placeholder="Enter contact number"
              value={form.supplierContact}
              onChange={handleChange}
              onKeyDown={(e) => handleFormKeyDown(e, "supplierContact")}
              className="form-input"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea
              ref={descriptionRef}
              name="description"
              placeholder="Enter product description"
              value={form.description}
              onChange={handleChange}
              onKeyDown={(e) => handleFormKeyDown(e, "description")}
              className="form-input textarea"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            {form._id ? "Update Inventory" : "Add Inventory"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-secondary"
          >
            Clear Form
          </button>
        </div>
      </form>

      <div className="table-container">
        <div className="table-header">
          <h2>Inventory Items</h2>
          <span className="item-count">{inventory.length} items</span>
        </div>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Company</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Buying Price</th>
              <th>Selling Price</th>
              <th>Margin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="8" className="empty-message">
                  No inventory items found
                </td>
              </tr>
            ) : (
              inventory.map((item) => {
                const margin =
                  item.sellingPrice && item.buyingPrice
                    ? (
                        ((item.sellingPrice - item.buyingPrice) /
                          item.buyingPrice) *
                        100
                      ).toFixed(1)
                    : 0;
                return (
                  <tr key={item._id}>
                    <td className="product-name">{item.name}</td>
                    <td>{item.company || "-"}</td>
                    <td>{item.category}</td>
                    <td
                      className={`stock ${item.currentStock <= 5 ? "low" : ""}`}
                    >
                      {item.currentStock}
                    </td>
                    <td>₹{item.buyingPrice?.toFixed(2) || "0.00"}</td>
                    <td>₹{item.sellingPrice?.toFixed(2) || "0.00"}</td>
                    <td className="margin-cell">{margin}%</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-action btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn-action btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
