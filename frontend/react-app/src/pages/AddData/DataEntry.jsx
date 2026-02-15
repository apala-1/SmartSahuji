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

  return (
    <div className="data-entry-container">
      <h2>Product Entry</h2>

      {errorMessage && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            backgroundColor: "#fee",
            color: "#c33",
            borderRadius: "4px",
            border: "1px solid #fcc",
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            backgroundColor: "#efe",
            color: "#3c3",
            borderRadius: "4px",
            border: "1px solid #cfc",
          }}
        >
          {successMessage}
        </div>
      )}

      <form className="data-entry-form" onSubmit={handleSubmit}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <label
            style={{
              fontWeight: "600",
              marginBottom: "5px",
              display: "block",
              color: "#333",
            }}
          >
            Product Name <span style={{ color: "#c33" }}>*</span>
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
            style={fieldErrors.product_name ? { borderColor: "#c33" } : {}}
          />

          {/* Searching indicator */}
          {isSearching && form.product_name.length >= 2 && (
            <div
              style={{
                position: "absolute",
                right: "10px",
                top: "40px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              Searching...
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {showDropdown && searchSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                marginTop: "2px",
              }}
            >
              {searchSuggestions.map((product, index) => (
                <div
                  key={product._id || index}
                  onClick={() => selectProduct(product)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedSuggestionIndex === index ? "#e3f2fd" : "white",
                    borderBottom:
                      index < searchSuggestions.length - 1
                        ? "1px solid #eee"
                        : "none",
                  }}
                >
                  <div style={{ fontWeight: "600", color: "#333" }}>
                    {product.name || product.product_name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "2px",
                    }}
                  >
                    {product.barcode && `Barcode: ${product.barcode}`}
                    {product.barcode && product.category && " | "}
                    {product.category && `Category: ${product.category}`}
                    {(product.sellingPrice || product.price) && (
                      <span
                        style={{
                          marginLeft: "8px",
                          color: "#27ae60",
                          fontWeight: "600",
                        }}
                      >
                        ₹{product.sellingPrice || product.price}
                      </span>
                    )}
                  </div>
                  {product.currentStock !== undefined && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: product.currentStock > 0 ? "#27ae60" : "#c33",
                        marginTop: "2px",
                      }}
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
              <div
                style={{
                  fontSize: "12px",
                  color: "#888",
                  marginTop: "4px",
                  fontStyle: "italic",
                }}
              >
                No matching products found. You can enter a new product.
              </div>
            )}

          {fieldErrors.product_name && (
            <span
              style={{
                color: "#c33",
                fontSize: "12px",
                marginTop: "2px",
                display: "block",
              }}
            >
              {fieldErrors.product_name}
            </span>
          )}
        </div>

        <div>
          <label
            style={{
              fontWeight: "600",
              marginBottom: "5px",
              display: "block",
              color: "#333",
            }}
          >
            Barcode <span style={{ color: "#c33" }}>*</span>
          </label>
          <input
            ref={barcodeRef}
            name="barcode"
            placeholder="Enter barcode or SKU"
            value={form.barcode}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, categoryRef)}
            required
            style={fieldErrors.barcode ? { borderColor: "#c33" } : {}}
          />
          {fieldErrors.barcode && (
            <span
              style={{
                color: "#c33",
                fontSize: "12px",
                marginTop: "2px",
                display: "block",
              }}
            >
              {fieldErrors.barcode}
            </span>
          )}
        </div>

        <div>
          <label
            style={{
              fontWeight: "600",
              marginBottom: "5px",
              display: "block",
              color: "#333",
            }}
          >
            Category
          </label>
          <select
            ref={categoryRef}
            name="category"
            value={form.category}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, priceRef)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              fontWeight: "600",
              marginBottom: "5px",
              display: "block",
              color: "#333",
            }}
          >
            Unit Price <span style={{ color: "#c33" }}>*</span>
          </label>
          <input
            ref={priceRef}
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter price per unit"
            value={form.price}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, discountRef)}
            required
            style={fieldErrors.price ? { borderColor: "#c33" } : {}}
          />
          {fieldErrors.price && (
            <span
              style={{
                color: "#c33",
                fontSize: "12px",
                marginTop: "2px",
                display: "block",
              }}
            >
              {fieldErrors.price}
            </span>
          )}
        </div>

        <div>
          <label
            style={{
              fontWeight: "600",
              marginBottom: "5px",
              display: "block",
              color: "#333",
            }}
          >
            Discount (%){" "}
            <span style={{ fontSize: "12px", color: "#888" }}>(optional)</span>
          </label>
          <input
            ref={discountRef}
            name="discount"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="Enter discount percentage (0-100)"
            value={form.discount}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, quantityRef)}
            style={fieldErrors.discount ? { borderColor: "#c33" } : {}}
          />
          {fieldErrors.discount && (
            <span
              style={{
                color: "#c33",
                fontSize: "12px",
                marginTop: "2px",
                display: "block",
              }}
            >
              {fieldErrors.discount}
            </span>
          )}
        </div>

        <div>
          <label
            style={{
              fontWeight: "600",
              marginBottom: "5px",
              display: "block",
              color: "#333",
            }}
          >
            Quantity <span style={{ color: "#c33" }}>*</span>
          </label>
          <input
            ref={quantityRef}
            name="quantity"
            type="number"
            min="1"
            step="1"
            placeholder="Enter quantity"
            value={form.quantity}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, dateRef)}
            required
            style={fieldErrors.quantity ? { borderColor: "#c33" } : {}}
          />
          {fieldErrors.quantity && (
            <span
              style={{
                color: "#c33",
                fontSize: "12px",
                marginTop: "2px",
                display: "block",
              }}
            >
              {fieldErrors.quantity}
            </span>
          )}
        </div>

        <div>
          <label
            style={{
              fontWeight: "600",
              marginBottom: "5px",
              display: "block",
              color: "#333",
            }}
          >
            Date
          </label>
          <input
            ref={dateRef}
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                // On last field, Enter does nothing - user must click Save
              }
            }}
          />
        </div>

        {/* Price Calculation Display */}
        {unitPrice > 0 && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f0f8ff",
              borderRadius: "4px",
              border: "1px solid #b0d4f1",
              marginTop: "10px",
            }}
          >
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              <strong>Price Before Discount:</strong> ₹{unitPrice.toFixed(2)}
            </div>
            {form.discount > 0 && (
              <div
                style={{
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#e67e22",
                }}
              >
                <strong>Discount ({form.discount}%):</strong> -₹
                {discountAmount.toFixed(2)}
              </div>
            )}
            <div style={{ marginBottom: "8px", fontSize: "14px" }}>
              <strong>Price After Discount:</strong> ₹
              {priceAfterDiscount.toFixed(2)}
            </div>
            {form.quantity > 0 && (
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#27ae60",
                  paddingTop: "8px",
                  borderTop: "1px solid #b0d4f1",
                }}
              >
                <strong>
                  Total ({form.quantity} × ₹{priceAfterDiscount.toFixed(2)}):
                </strong>{" "}
                ₹{total.toFixed(2)}
              </div>
            )}
          </div>
        )}

        <button type="submit">Save Transaction</button>
      </form>

      <div className="bulk-upload">
        <h2>Bulk Upload</h2>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
}
