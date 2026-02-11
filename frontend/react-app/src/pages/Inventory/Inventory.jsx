import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../../styles/Inventory.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    sku: "",
    minStock: "",
    reorderQty: "",
    description: "",
    _id: null,
  });
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:5000/api/inventory",
    headers: { Authorization: `Bearer ${token}` },
  });

  // ==============================
  // Fetch inventory
  // ==============================
  const fetchInventory = async () => {
    try {
      const res = await api.get("/");
      setInventory(res.data.inventory || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch inventory");
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line
  }, []);

  // ==============================
  // Form handlers
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      sku: "",
      minStock: "",
      reorderQty: "",
      description: "",
      _id: null,
    });
  };

  // ==============================
  // Add / Update Inventory
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quantityBought) {
      return toast.warning("Please provide name and quantity bought");
    }

    const payload = {
      ...form,
      buyingPrice: Number(form.buyingPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      quantityBought: Number(form.quantityBought) || 0,
      currentStock:
        Number(form.currentStock) || Number(form.quantityBought) || 0,
      minStock: Number(form.minStock) || 0,
      reorderQty: Number(form.reorderQty) || 0,
    };

    try {
      const res = form._id
        ? await api.put(`/${form._id}`, payload)
        : await api.post("/", payload);

      toast.success(res.data.message);
      resetForm();
      fetchInventory();
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to save inventory");
    }
  };

  // ==============================
  // Edit / Delete
  // ==============================
  const handleEdit = (item) => {
    setForm({
      ...item,
      dateBought: item.dateBought ? item.dateBought.slice(0, 10) : "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await api.delete(`/${id}`);
      toast.success(res.data.message);
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  // ==============================
  // Export to Excel
  // ==============================
  const handleExport = async () => {
    try {
      const res = await api.get("/export/excel", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };

  // ==============================
  // Bulk Upload Preview
  // ==============================
  const handleBulkUploadPreview = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (jsonData.length === 0) {
          return toast.warning("Excel file is empty");
        }

        setPreviewData(jsonData);
        setShowPreview(true);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read Excel file");
    }
  };

  const confirmBulkUpload = async () => {
    const fileInput = document.getElementById("bulk-upload-file");
    if (!fileInput.files[0]) return toast.warning("No file selected");

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await api.post("/upload/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      fetchInventory();
      setShowPreview(false);
      fileInput.value = "";
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Bulk upload failed");
    }
  };

  // ==============================
  // Search & Pagination
  // ==============================
  const filteredInventory = inventory.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemType?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="inventory-page">
      <ToastContainer position="top-right" autoClose={3000} />

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

      {/* Search Bar */}
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
          {[
            {
              name: "name",
              placeholder: "Product Name",
              type: "text",
              required: true,
            },
            { name: "company", placeholder: "Company / Brand", type: "text" },
            {
              name: "buyingPrice",
              placeholder: "Buying Price",
              type: "number",
            },
            {
              name: "sellingPrice",
              placeholder: "Selling Price",
              type: "number",
            },
            {
              name: "quantityBought",
              placeholder: "Quantity Bought",
              type: "number",
            },
            {
              name: "currentStock",
              placeholder: "Current Stock",
              type: "number",
            },
            { name: "itemType", placeholder: "Category / Type", type: "text" },
            { name: "dateBought", placeholder: "Date Bought", type: "date" },
            { name: "sku", placeholder: "SKU", type: "text" },
            { name: "minStock", placeholder: "Min Stock", type: "number" },
            { name: "reorderQty", placeholder: "Reorder Qty", type: "number" },
            { name: "description", placeholder: "Description", type: "text" },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required || false}
            />
          ))}
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
