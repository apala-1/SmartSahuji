import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/DataEntry.css";

const DataEntry = () => {
  const navigate = useNavigate();

  const [transactionType, setTransactionType] = useState("Sale");
  const [formData, setFormData] = useState({
    product_name: "",
    barcode: "",
    category: "",
    sale_type: "",
    price: "",
    cost: "",
    quantity: "",
    date: "",
  });

  const [currentStock, setCurrentStock] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Trigger autofill on product_name or barcode
    if (name === "product_name" || name === "barcode") {
      fetchProductDetails(
        name === "product_name" ? value : undefined,
        name === "barcode" ? value : undefined,
      );
    }
  };

  // ===============================
  // FETCH PRODUCT DETAILS FOR AUTOFILL
  // ===============================
  const fetchProductDetails = async (name, barcode) => {
    if (!name && !barcode) return;

    try {
      const query = new URLSearchParams();
      if (name) query.append("name", name);
      if (barcode) query.append("barcode", barcode);

      const res = await axios.get(`/api/inventory/autofill?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = res.data;

      if (data) {
        setFormData((prev) => ({
          ...prev,
          product_name: data.name,
          barcode: data.barcode,
          category: data.category,
          price: data.sellingPrice || "",
          cost: data.buyingPrice || "",
        }));
        setCurrentStock(data.currentStock);
      } else {
        setCurrentStock(null);
      }
    } catch (err) {
      setCurrentStock(null);
      console.error("Autofill error:", err);
    }
  };

  // ===============================
  // HANDLE FORM SUBMIT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_name || !formData.quantity || !formData.date) {
      toast.error("Product name, quantity and date are required");
      return;
    }

    if (
      transactionType === "Sale" &&
      (!formData.price || !formData.sale_type)
    ) {
      toast.error("Sale requires price and sale type");
      return;
    }

    if (transactionType === "Sale" && currentStock !== null) {
      if (currentStock <= 0) {
        toast.error("Product is out of stock");
        return;
      }

      if (Number(formData.quantity) > currentStock) {
        toast.error(`Only ${currentStock} items available`);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "/api/products",
        {
          ...formData,
          item_type: transactionType,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      toast.success(res.data.message);
      setFormData({
        product_name: "",
        barcode: "",
        category: "",
        sale_type: "",
        price: "",
        cost: "",
        quantity: "",
        date: "",
      });
      setCurrentStock(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-entry-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Product Transaction Entry</h2>

      <form onSubmit={handleSubmit} className="data-entry-form">
        {/* TRANSACTION TYPE */}
        <label>
          Transaction Type
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
          </select>
        </label>

        {/* PRODUCT NAME */}
        <label>
          Product Name
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </label>

        {/* BARCODE */}
        <label>
          Barcode
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="Enter barcode"
          />
        </label>

        {/* CATEGORY */}
        <label>
          Category
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
          />
        </label>

        {/* SALE TYPE */}
        {transactionType === "Sale" && (
          <label>
            Sale Type
            <input
              type="text"
              name="sale_type"
              value={formData.sale_type}
              onChange={handleChange}
              placeholder="Retail / Wholesale"
            />
          </label>
        )}

        {/* PRICE */}
        {transactionType === "Sale" && (
          <label>
            Selling Price
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Selling Price"
            />
          </label>
        )}

        {/* COST */}
        {transactionType === "Purchase" && (
          <label>
            Cost / Buying Price
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="Cost price"
            />
          </label>
        )}

        {/* QUANTITY */}
        <label>
          Quantity
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />
        </label>

        {/* CURRENT STOCK */}
        {currentStock !== null && (
          <p className="stock-info">Current Stock: {currentStock}</p>
        )}

        {/* DATE */}
        <label>
          Date
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Transaction"}
        </button>
      </form>
    </div>
  );
};

export default DataEntry;
