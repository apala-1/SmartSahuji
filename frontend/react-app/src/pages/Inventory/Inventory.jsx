import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../../styles/Inventory.css";

const ITEMS_PER_PAGE = 10;

const InventoryPage = () => {
  const token = localStorage.getItem("token");
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    name: "",
    company: "",
    buyingPrice: "",
    sellingPrice: "",
    quantityBought: "",
    currentStock: "",
    itemType: "",
    dateBought: "",
    status: "Active",
    lastBoughtQty: "",
    sku: "",
    minStock: "",
    reorderQty: "",
    description: "",
    _id: null,
  });

  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch all inventory
  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(res.data.inventory);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch inventory");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form._id) {
        const res = await axios.put(
          `http://localhost:5000/api/inventory/${form._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        alert(res.data.message);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/inventory",
          form,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        alert(res.data.message);
      }
      resetForm();
      fetchInventory();
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save inventory");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      company: "",
      buyingPrice: "",
      sellingPrice: "",
      quantityBought: "",
      currentStock: "",
      itemType: "",
      dateBought: "",
      status: "Active",
      lastBoughtQty: "",
      sku: "",
      minStock: "",
      reorderQty: "",
      description: "",
      _id: null,
    });
  };

  // Edit
  const handleEdit = (item) => {
    setForm({
      ...item,
      dateBought: item.dateBought ? item.dateBought.slice(0, 10) : "",
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/inventory/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(res.data.message);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  // Export to Excel
  const handleExport = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/inventory/export/excel",
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  // Bulk Upload Preview
  const handleBulkUploadPreview = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      setPreviewData(jsonData);
      setShowPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmBulkUpload = async () => {
    const fileInput = document.getElementById("bulk-upload-file");
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/inventory/upload/excel",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      alert(res.data.message);
      fetchInventory();
      setShowPreview(false);
      fileInput.value = "";
    } catch (err) {
      console.error(err);
      alert("Bulk upload failed");
    }
  };

  // Search & Pagination
  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemType.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="inventory-page">
      <h2>Inventory Dashboard</h2>

      {/* Export / Bulk Upload */}
      <div className="inventory-actions">
        <button onClick={handleExport}>Export to Excel</button>
        <input
          type="file"
          id="bulk-upload-file"
          accept=".xlsx, .xls"
          onChange={handleBulkUploadPreview}
          style={{ marginLeft: "10px" }}
        />
      </div>

      {/* Bulk Upload Preview */}
      {showPreview && (
        <div className="bulk-preview">
          <h4>Excel Preview</h4>
          <div className="preview-table-container">
            <table>
              <thead>
                <tr>
                  {previewData[0] &&
                    Object.keys(previewData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={confirmBulkUpload}>Confirm Upload</button>
          <button onClick={() => setShowPreview(false)}>Cancel</button>
        </div>
      )}

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, company or category..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button onClick={() => setSearchQuery("")}>Reset</button>
      </div>

      {/* Inventory Form */}
      <form className="inventory-form" onSubmit={handleSubmit}>
        <h3>{form._id ? "Update Inventory" : "Add Inventory"}</h3>
        <div className="form-grid">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="company"
            placeholder="Company / Brand"
            value={form.company}
            onChange={handleChange}
          />
          <input
            type="number"
            name="buyingPrice"
            placeholder="Buying Price"
            value={form.buyingPrice}
            onChange={handleChange}
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
          />
          <input
            type="number"
            name="currentStock"
            placeholder="Current Stock"
            value={form.currentStock}
            onChange={handleChange}
          />
          <input
            type="text"
            name="itemType"
            placeholder="Category / Type"
            value={form.itemType}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dateBought"
            value={form.dateBought}
            onChange={handleChange}
          />
          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleChange}
          />
          <input
            type="number"
            name="minStock"
            placeholder="Min Stock"
            value={form.minStock}
            onChange={handleChange}
          />
          <input
            type="number"
            name="reorderQty"
            placeholder="Reorder Qty"
            value={form.reorderQty}
            onChange={handleChange}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <button type="submit">{form._id ? "Update Item" : "Add Item"}</button>
      </form>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="inventory-table">
          <thead className="sticky-header">
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Buying Price</th>
              <th>Selling Price</th>
              <th>Qty</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map((item) => (
              <tr
                key={item._id}
                className={
                  item.minStock && item.currentStock < item.minStock
                    ? "low-stock"
                    : ""
                }
              >
                <td>{item.name}</td>
                <td>{item.company}</td>
                <td>{item.buyingPrice}</td>
                <td>{item.sellingPrice}</td>
                <td>{item.quantityBought}</td>
                <td>{item.currentStock}</td>
                <td>{item.itemType}</td>
                <td>
                  {item.dateBought
                    ? new Date(item.dateBought).toLocaleDateString()
                    : ""}
                </td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
