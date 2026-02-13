import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../styles/Inventory.css";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState(null);

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
     Add / Update inventory
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        alert("Inventory updated");
      } else {
        await axiosInstance.post("/inventory", payload);
        alert("Inventory added");
      }

      resetForm();
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save inventory");
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
      fetchInventory();
    } catch (err) {
      alert("Failed to delete");
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
    <div className="inventory-page">
      <h2>Inventory Management</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          placeholder="Search name / company / category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button>Search</button>
      </form>

      <div className="inventory-actions">
        <button onClick={handleExport}>Export Excel</button>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleBulkUpload}>Bulk Upload</button>
      </div>

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
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
        />
        <input
          name="barcode"
          placeholder="Barcode"
          value={form.barcode}
          onChange={handleChange}
          onBlur={handleAutofill}
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

        <select name="category" value={form.category} onChange={handleChange}>
          <option>General</option>
          <option>Electronics</option>
          <option>Groceries</option>
          <option>Clothing</option>
          <option>Accessories</option>
        </select>

        <input
          name="supplierName"
          placeholder="Supplier Name"
          value={form.supplierName}
          onChange={handleChange}
        />
        <input
          name="supplierContact"
          placeholder="Supplier Contact"
          value={form.supplierContact}
          onChange={handleChange}
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit">{form._id ? "Update" : "Add"} Inventory</button>
      </form>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Stock</th>
            <th>Buying</th>
            <th>Selling</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.company}</td>
              <td>{item.currentStock}</td>
              <td>{item.buyingPrice}</td>
              <td>{item.sellingPrice}</td>
              <td>{item.category}</td>
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
