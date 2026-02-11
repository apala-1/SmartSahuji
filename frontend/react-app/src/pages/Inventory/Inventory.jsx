import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Inventory.css";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({
    name: "",
    company: "",
    barcode: "",
    buyingPrice: "",
    sellingPrice: "",
    quantityBought: "",
    currentStock: "",
    itemType: "General",
    description: "",
    _id: null, // for editing
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState(null);

  // Axios instance
  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
  });

  // Request interceptor to add token
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor to refresh token on 401
  axiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalReq = err.config;
      if (err.response && err.response.status === 401 && !originalReq._retry) {
        originalReq._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          alert("Session expired. Please login again.");
          return Promise.reject(err);
        }

        try {
          const res = await axios.post(
            "http://localhost:5000/api/auth/refresh",
            { token: refreshToken },
          );
          localStorage.setItem("token", res.data.token);
          originalReq.headers.Authorization = `Bearer ${res.data.token}`;
          return axiosInstance(originalReq);
        } catch (refreshErr) {
          alert("Session expired. Please login again.");
          return Promise.reject(refreshErr);
        }
      }
      return Promise.reject(err);
    },
  );

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const res = await axiosInstance.get("/inventory");
      const items = Array.isArray(res.data)
        ? res.data
        : res.data.inventory || [];
      setInventory(items);
    } catch (err) {
      console.error("Fetch inventory error:", err);
      setInventory([]);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Auto-fill
  const handleAutofill = async (e) => {
    const value = e.target.value;
    if (!value) return;
    try {
      const res = await axiosInstance.get(`/inventory/autofill?query=${value}`);
      if (res.data && res.data.product_name) {
        setForm({
          ...form,
          name: res.data.product_name,
          company: res.data.company,
          barcode: value,
          buyingPrice: res.data.buyingPrice,
          sellingPrice: res.data.sellingPrice,
          currentStock: res.data.currentStock,
          itemType: res.data.itemType,
          _id: res.data._id || null,
        });
      }
    } catch (err) {
      console.error("Autofill error:", err);
    }
  };

  // Add / Update inventory
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form._id) {
        // Update existing
        await axiosInstance.put(`/inventory/${form._id}`, form);
        alert("Inventory updated!");
      } else {
        // Add new
        await axiosInstance.post("/inventory", form);
        alert("Inventory added!");
      }

      // Reset form
      setForm({
        name: "",
        company: "",
        barcode: "",
        buyingPrice: "",
        sellingPrice: "",
        quantityBought: "",
        currentStock: "",
        itemType: "General",
        description: "",
        _id: null,
      });

      fetchInventory();
    } catch (err) {
      console.error("Add/Update inventory error:", err);
      alert(err.response?.data?.error || "Failed to save inventory");
    }
  };

  // Edit inventory
  const handleEdit = (item) => {
    setForm({ ...item });
  };

  // Delete inventory
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axiosInstance.delete(`/inventory/${id}`);
      alert("Item deleted!");
      fetchInventory();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete item");
    }
  };

  // Search inventory
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.get(
        `/inventory/search?query=${searchQuery}`,
      );
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setInventory(items);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // Export inventory
  const handleExport = async () => {
    try {
      const res = await axiosInstance.get("/inventory/export/excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export inventory");
    }
  };

  // Bulk upload
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleBulkUpload = async () => {
    if (!file) return alert("Select a file first!");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axiosInstance.post("/inventory/upload/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Bulk upload successful!");
      setFile(null);
      fetchInventory();
    } catch (err) {
      console.error("Bulk upload error:", err);
      alert(err.response?.data?.error || "Bulk upload failed");
    }
  };

  return (
    <div className="inventory-page">
      <h2>Inventory Management</h2>

      {/* Search */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name, company or category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Export & Bulk Upload */}
      <div className="inventory-actions">
        <button onClick={handleExport}>Export to Excel</button>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleBulkUpload}>Bulk Upload</button>
      </div>

      {/* Add / Edit Inventory Form */}
      <form className="inventory-form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleAutofill}
          required
        />
        <input
          name="company"
          placeholder="Company/Brand"
          value={form.company}
          onChange={handleChange}
          required
        />
        <input
          name="barcode"
          placeholder="Barcode"
          value={form.barcode}
          onChange={handleChange}
          onBlur={handleAutofill}
          required
        />
        <input
          type="number"
          name="buyingPrice"
          placeholder="Buying Price"
          value={form.buyingPrice}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="sellingPrice"
          placeholder="Selling Price"
          value={form.sellingPrice}
          onChange={handleChange}
        />
        <input
          type="number"
          name="quantityBought"
          placeholder="Quantity Bought"
          value={form.quantityBought}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="currentStock"
          placeholder="Current Stock"
          value={form.currentStock}
          onChange={handleChange}
          required
        />
        <select name="itemType" value={form.itemType} onChange={handleChange}>
          <option value="General">General</option>
          <option value="Electronics">Electronics</option>
          <option value="Food">Food</option>
          <option value="Clothing">Clothing</option>
        </select>
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit">{form._id ? "Update" : "Add"} Inventory</button>
      </form>

      {/* Inventory Table */}
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Barcode</th>
            <th>Buying</th>
            <th>Selling</th>
            <th>Qty Bought</th>
            <th>Current Stock</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(inventory) &&
            inventory.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.company}</td>
                <td>{item.barcode}</td>
                <td>{item.buyingPrice}</td>
                <td>{item.sellingPrice}</td>
                <td>{item.quantityBought}</td>
                <td>{item.currentStock}</td>
                <td>{item.itemType}</td>
                <td>{item.description}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
