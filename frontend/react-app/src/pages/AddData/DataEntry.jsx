import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../styles/DataEntry.css";

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
    price: 0,
    discount: 0,
    quantity: 1,
    date: new Date().toISOString().slice(0, 10),
  });

  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Autocomplete state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for input fields navigation
  const productNameRef = useRef(null);
  const barcodeRef = useRef(null);
  const categoryRef = useRef(null);
  const priceRef = useRef(null);
  const discountRef = useRef(null);
  const quantityRef = useRef(null);
  const dateRef = useRef(null);
  const dropdownRef = useRef(null);

  // Create API instance with auth headers
  const getAPI = () => {
    const API = axios.create({ baseURL: "http://localhost:5000/api" });
    API.interceptors.request.use((req) => {
      const token = localStorage.getItem("token");
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    });
    return API;
  };

  // Search inventory for autocomplete
  useEffect(() => {
    const searchInventory = async () => {
      const query = form.product_name.trim();
      if (!query || query.length < 2) {
        setSearchSuggestions([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const API = getAPI();
        console.log("🔍 Searching inventory for:", query);
        const { data } = await API.get(
          `/inventory/search?query=${encodeURIComponent(query)}`,
        );
        console.log("✅ Search response:", data);

        if (data && data.items && Array.isArray(data.items)) {
          console.log("📦 Found", data.items.length, "items");
          setSearchSuggestions(data.items.slice(0, 5)); // Limit to 5 suggestions
          setShowDropdown(data.items.length > 0);
        } else {
          console.log("⚠️ No items found or invalid response format");
          setSearchSuggestions([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error("❌ Search error:", err);
        if (err.response) {
          console.error("Error details:", err.response.data);
          console.error("Status:", err.response.status);
        }
        setSearchSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchInventory, 300);
    return () => clearTimeout(timeoutId);
  }, [form.product_name]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Select product from autocomplete dropdown
  const selectProduct = (product) => {
    console.log("🎯 Selected product:", product);
    setForm({
      ...form,
      product_name: product.name || product.product_name || "",
      barcode: product.barcode || "",
      category: product.category || "General",
      price: product.sellingPrice || product.price || 0,
    });
    setShowDropdown(false);
    setSelectedSuggestionIndex(-1);
    // Focus next field
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);
  };

  // Calculate prices
  const unitPrice = parseFloat(form.price) || 0;
  const discountAmount = (unitPrice * (parseFloat(form.discount) || 0)) / 100;
  const priceAfterDiscount = unitPrice - discountAmount;
  const total = priceAfterDiscount * (parseInt(form.quantity) || 0);

  // Validate required fields before saving
  const validateForm = () => {
    const errors = {};

    if (!form.product_name.trim()) {
      errors.product_name = "Product Name is required";
    }

    if (!form.barcode.trim()) {
      errors.barcode = "Barcode is required";
    }

    if (!form.quantity || form.quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0";
    }

    if (!form.price || form.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (form.discount < 0 || form.discount > 100) {
      errors.discount = "Discount must be between 0 and 100";
    }

    return errors;
  };

  // Handle Enter key navigation
  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  // Handle keyboard navigation in product name field
  const handleProductNameKeyDown = (e) => {
    if (!showDropdown || searchSuggestions.length === 0) {
      // No dropdown, just normal navigation
      if (e.key === "Enter") {
        e.preventDefault();
        barcodeRef.current?.focus();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectProduct(searchSuggestions[selectedSuggestionIndex]);
        } else {
          // No selection, just move to next field
          setShowDropdown(false);
          barcodeRef.current?.focus();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});

    // Validate form before saving
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please fix the errors below");
      return;
    }

    try {
      const API = getAPI();
      // Prepare data for backend with required fields
      const submitData = {
        product_name: form.product_name,
        barcode: form.barcode,
        category: form.category,
        item_type: "Sale", // Default to Sale
        sale_type: "Retail", // Default to Retail
        price: priceAfterDiscount, // Send final price after discount
        quantity: form.quantity,
        date: form.date,
        // Store original price and discount for reference
        original_price: unitPrice,
        discount_percent: form.discount,
      };

      await API.post("/products", submitData);
      setSuccessMessage("Transaction saved successfully!");
      setForm({
        product_name: "",
        barcode: "",
        category: "General",
        price: 0,
        discount: 0,
        quantity: 1,
        date: new Date().toISOString().slice(0, 10),
      });
      // Reset focus to first field
      productNameRef.current?.focus();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      if (err.response?.status === 401) {
        setErrorMessage("Authentication failed. Please log in again.");
      } else if (err.response?.status === 400) {
        setErrorMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Invalid data. Please check your inputs.",
        );
      } else {
        setErrorMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Error saving transaction. Please try again.",
        );
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const API = getAPI();
      const { data } = await API.post("/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMessage(`${data.count} products uploaded successfully!`);
      setFile(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.status === 401) {
        setErrorMessage("Authentication failed. Please log in again.");
      } else if (err.response?.status === 400) {
        setErrorMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Invalid file format. Please check your file and try again.",
        );
      } else {
        setErrorMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Bulk upload failed. Please try again.",
        );
      }
    }
  };

  const handleReset = () => {
    setForm({
      product_name: "",
      barcode: "",
      category: "General",
      price: 0,
      discount: 0,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
    });
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    productNameRef.current?.focus();
  };

  return (
    <div className="data-entry-container">
      <div className="entry-header">
        <h2>📝 Product Entry</h2>
        <p className="entry-subtitle">Add new products to your inventory</p>
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          <span className="alert-icon">❌</span>
          <span className="alert-message">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span className="alert-message">{successMessage}</span>
        </div>
      )}

      <form className="data-entry-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Product Name Field */}
          <div
            className="form-group"
            style={{ position: "relative" }}
            ref={dropdownRef}
          >
            <label className="form-label">
              Product Name <span className="required-star">*</span>
            </label>
            <input
              ref={productNameRef}
              name="product_name"
              placeholder="Type to search or enter new product"
              value={form.product_name}
              onChange={handleChange}
              onKeyDown={handleProductNameKeyDown}
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowDropdown(true);
                }
              }}
              required
              autoComplete="off"
              className={`form-input ${fieldErrors.product_name ? "error" : ""}`}
            />

            {/* Searching indicator */}
            {isSearching && form.product_name.length >= 2 && (
              <div className="search-indicator">
                <span className="spinner"></span> Searching...
              </div>
            )}

            {/* Autocomplete Dropdown */}
            {showDropdown && searchSuggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {searchSuggestions.map((product, index) => (
                  <div
                    key={product._id || index}
                    onClick={() => selectProduct(product)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    className={`dropdown-item ${
                      selectedSuggestionIndex === index ? "active" : ""
                    }`}
                  >
                    <div className="dropdown-product-name">
                      {product.name || product.product_name}
                    </div>
                    <div className="dropdown-product-meta">
                      {product.barcode && `Barcode: ${product.barcode}`}
                      {product.barcode && product.category && " | "}
                      {product.category && `Category: ${product.category}`}
                      {(product.sellingPrice || product.price) && (
                        <span className="dropdown-product-price">
                          ₹{product.sellingPrice || product.price}
                        </span>
                      )}
                    </div>
                    {product.currentStock !== undefined && (
                      <div
                        className={`dropdown-product-stock ${
                          product.currentStock > 0 ? "in-stock" : "out-stock"
                        }`}
                      >
                        Stock: {product.currentStock}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No results message */}
            {!isSearching &&
              form.product_name.length >= 2 &&
              searchSuggestions.length === 0 &&
              !showDropdown && (
                <div className="no-results">
                  No matching products found. You can enter a new product.
                </div>
              )}

            {fieldErrors.product_name && (
              <span className="error-message">{fieldErrors.product_name}</span>
            )}
          </div>

          {/* Barcode Field */}
          <div className="form-group">
            <label className="form-label">
              Barcode <span className="required-star">*</span>
            </label>
            <input
              ref={barcodeRef}
              name="barcode"
              placeholder="Enter barcode or SKU"
              value={form.barcode}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, categoryRef)}
              required
              className={`form-input ${fieldErrors.barcode ? "error" : ""}`}
            />
            {fieldErrors.barcode && (
              <span className="error-message">{fieldErrors.barcode}</span>
            )}
          </div>

          {/* Category Field */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              ref={categoryRef}
              name="category"
              value={form.category}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, priceRef)}
              className="form-input"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Price Field */}
          <div className="form-group">
            <label className="form-label">
              Unit Price <span className="required-star">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">₹</span>
              <input
                ref={priceRef}
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, discountRef)}
                required
                className={`form-input ${fieldErrors.price ? "error" : ""}`}
              />
            </div>
            {fieldErrors.price && (
              <span className="error-message">{fieldErrors.price}</span>
            )}
          </div>

          {/* Discount Field */}
          <div className="form-group">
            <label className="form-label">
              Discount <span className="optional-label">(optional)</span>
            </label>
            <div className="input-with-suffix">
              <input
                ref={discountRef}
                name="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0"
                value={form.discount}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, quantityRef)}
                className={`form-input ${fieldErrors.discount ? "error" : ""}`}
              />
              <span className="input-suffix">%</span>
            </div>
            {fieldErrors.discount && (
              <span className="error-message">{fieldErrors.discount}</span>
            )}
          </div>

          {/* Quantity Field */}
          <div className="form-group">
            <label className="form-label">
              Quantity <span className="required-star">*</span>
            </label>
            <input
              ref={quantityRef}
              name="quantity"
              type="number"
              min="1"
              step="1"
              placeholder="1"
              value={form.quantity}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              required
              className={`form-input ${fieldErrors.quantity ? "error" : ""}`}
            />
            {fieldErrors.quantity && (
              <span className="error-message">{fieldErrors.quantity}</span>
            )}
          </div>

          {/* Date Field */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              ref={dateRef}
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              className="form-input"
            />
          </div>
        </div>

        {/* Price Calculation Display */}
        {unitPrice > 0 && (
          <div className="price-summary">
            <div className="summary-row">
              <span className="summary-label">Price Before Discount:</span>
              <span className="summary-value">₹{unitPrice.toFixed(2)}</span>
            </div>
            {form.discount > 0 && (
              <div className="summary-row discount-row">
                <span className="summary-label">
                  Discount ({form.discount}%):
                </span>
                <span className="summary-value discount">
                  -₹{discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Price After Discount:</span>
              <span className="summary-value highlight">
                ₹{priceAfterDiscount.toFixed(2)}
              </span>
            </div>
            {form.quantity > 0 && (
              <div className="summary-row total-row">
                <span className="summary-label">
                  Total ({form.quantity} × ₹{priceAfterDiscount.toFixed(2)}):
                </span>
                <span className="summary-value total">₹{total.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            💾 Save Transaction
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
          >
            🔄 Clear Form
          </button>
        </div>
      </form>

      <div className="bulk-upload-section">
        <div className="section-header">
          <h3>📤 Bulk Upload</h3>
          <p className="section-subtitle">Upload multiple products at once</p>
        </div>
        <div className="upload-area">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="file-label">
            {file ? (
              <>
                <span className="file-icon">📎</span>
                <span className="file-name">{file.name}</span>
              </>
            ) : (
              <>
                <span className="file-icon">📁</span>
                <span className="file-text">Choose CSV or XLSX file</span>
              </>
            )}
          </label>
          <button
            onClick={handleUpload}
            className="btn btn-primary upload-btn"
            disabled={!file}
          >
            ⬆️ Upload File
          </button>
        </div>
        <div className="upload-hint">📋 Supported formats: CSV, XLSX</div>
      </div>
    </div>
  );
}
