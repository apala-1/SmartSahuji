import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SalesHistory.css";

export default function SalesHistory() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All"); // All, Sale, Purchase
  const [inventoryMap, setInventoryMap] = useState({}); // Map barcode/name to buying price
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Fetch inventory data to get buying prices
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchInventory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/inventory", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();

          // Backend returns {inventory: [...]}
          const items = data.inventory || [];

          // Create a map for quick lookup: barcode/name -> buying price
          const map = {};
          items.forEach((item) => {
            if (item.barcode) {
              map[item.barcode.toUpperCase()] = {
                buyingPrice: item.buyingPrice,
                sellingPrice: item.sellingPrice,
                stock: item.currentStock,
              };
            }
            if (item.name) {
              map[item.name.toLowerCase()] = {
                buyingPrice: item.buyingPrice,
                sellingPrice: item.sellingPrice,
                stock: item.currentStock,
              };
            }
          });
          setInventoryMap(map);
        }
      } catch (err) {
        console.error("❌ Failed to fetch inventory:", err);
      }
    };

    fetchInventory();
  }, []);

  // Fetch sales data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    const fetchSales = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Try to get error message from response
          const errorData = await res.json().catch(() => ({}));
          const errorMessage =
            errorData.error ||
            errorData.message ||
            `Server error (${res.status})`;

          // If unauthorized, redirect to login
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            alert("Your session has expired. Please login again.");
            navigate("/login");
            return;
          }

          throw new Error(errorMessage);
        }

        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.message ||
            "Failed to connect to server. Please check if the backend is running.",
        );
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [navigate]);

  // Get buying price from inventory
  const getBuyingPrice = (sale) => {
    // First try to get from inventory map by barcode
    if (sale.barcode) {
      const barcodeKey = sale.barcode.toUpperCase();
      const inv = inventoryMap[barcodeKey];
      if (inv) {
        return inv.buyingPrice || 0;
      }
    }

    // Then try by product name
    if (sale.product_name) {
      const nameKey = sale.product_name.toLowerCase();
      const inv = inventoryMap[nameKey];
      if (inv) {
        return inv.buyingPrice || 0;
      }
    }

    // Fallback to stored cost (for purchases) or 0
    return sale.cost || 0;
  };

  // Calculate profit for a sale
  const calculateProfit = (sale) => {
    if (sale.item_type !== "Sale") return null;

    const sellingPrice = sale.price || 0;
    const buyingPrice = getBuyingPrice(sale);
    const quantity = sale.quantity || 0;

    const profit = (sellingPrice - buyingPrice) * quantity;
    return profit;
  };

  // Filter sales based on selected type, search, and date range
  const filteredSales = sales.filter((s) => {
    // Filter by type
    const typeMatch = filter === "All" || s.item_type === filter;

    // Filter by search term
    const searchMatch =
      !searchTerm ||
      s.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by date range
    let dateMatch = true;
    if (dateRange.start || dateRange.end) {
      const saleDate = new Date(s.date);
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        dateMatch = dateMatch && saleDate >= startDate;
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        dateMatch = dateMatch && saleDate <= endDate;
      }
    }

    return typeMatch && searchMatch && dateMatch;
  });

  // Calculate totals
  const totals = filteredSales.reduce(
    (acc, sale) => {
      const profit = calculateProfit(sale);
      if (profit !== null) {
        acc.totalProfit += profit;
        acc.totalSales += (sale.price || 0) * (sale.quantity || 0);
        acc.totalCost += getBuyingPrice(sale) * (sale.quantity || 0);
      }
      return acc;
    },
    { totalProfit: 0, totalSales: 0, totalCost: 0 },
  );

  // Render loading state
  if (loading) {
    return (
      <div className="sales-history-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading sales data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="sales-history-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p className="error-text">{error}</p>
          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-history-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">📊 Sales History</h1>
          <p className="page-subtitle">Track and analyze your transactions</p>
        </div>
        <button
          className="analytics-btn"
          onClick={() => navigate("/analytics")}
        >
          📈 View Analytics
        </button>
      </div>

      {/* Stats Cards */}
      {filter === "Sale" && filteredSales.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">₹{totals.totalSales.toFixed(2)}</h3>
            </div>
          </div>
          <div className="stat-card cost">
            <div className="stat-icon">💸</div>
            <div className="stat-content">
              <p className="stat-label">Total Cost</p>
              <h3 className="stat-value">₹{totals.totalCost.toFixed(2)}</h3>
            </div>
          </div>
          <div className="stat-card profit">
            <div className="stat-icon">
              {totals.totalProfit >= 0 ? "📈" : "📉"}
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Profit</p>
              <h3
                className="stat-value"
                style={{
                  color: totals.totalProfit >= 0 ? "#27ae60" : "#e74c3c",
                }}
              >
                ₹{totals.totalProfit.toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="stat-card margin">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Profit Margin</p>
              <h3
                className="stat-value"
                style={{
                  color: totals.totalProfit >= 0 ? "#27ae60" : "#e74c3c",
                }}
              >
                {totals.totalSales > 0
                  ? ((totals.totalProfit / totals.totalSales) * 100).toFixed(2)
                  : "0.00"}
                %
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Section */}
      <div className="controls-section">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "All" ? "active" : ""}`}
            onClick={() => setFilter("All")}
          >
            All Transactions ({sales.length})
          </button>
          <button
            className={`filter-tab ${filter === "Sale" ? "active" : ""}`}
            onClick={() => setFilter("Sale")}
          >
            Sales ({sales.filter((s) => s.item_type === "Sale").length})
          </button>
          <button
            className={`filter-tab ${filter === "Purchase" ? "active" : ""}`}
            onClick={() => setFilter("Purchase")}
          >
            Purchases ({sales.filter((s) => s.item_type === "Purchase").length})
          </button>
        </div>

        <div className="search-filter-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by product, barcode, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="date-filters">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="date-input"
              placeholder="Start Date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="date-input"
              placeholder="End Date"
            />
            {(dateRange.start || dateRange.end) && (
              <button
                className="clear-dates"
                onClick={() => setDateRange({ start: "", end: "" })}
                title="Clear dates"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span className="results-count">
          {filteredSales.length}{" "}
          {filteredSales.length === 1 ? "result" : "results"} found
        </span>
        {(searchTerm ||
          dateRange.start ||
          dateRange.end ||
          filter !== "All") && (
          <button
            className="clear-all-filters"
            onClick={() => {
              setSearchTerm("");
              setDateRange({ start: "", end: "" });
              setFilter("All");
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Table Section */}
      {filteredSales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No transactions found</h3>
          <p>
            {searchTerm || dateRange.start || dateRange.end
              ? "Try adjusting your filters or search criteria"
              : filter !== "All"
                ? `No ${filter.toLowerCase()} records available`
                : "Start adding transactions to see them here"}
          </p>
          <button
            className="add-transaction-btn"
            onClick={() => navigate("/data-entry")}
          >
            + Add Transaction
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Type</th>
                <th className="text-right">Selling Price</th>
                <th className="text-right">Buying Price</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Profit</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => {
                const buyingPrice = getBuyingPrice(s);
                const profit = calculateProfit(s);
                const sellingPrice = s.price || 0;

                return (
                  <tr key={s._id}>
                    <td>
                      <div className="product-cell">
                        <span className="product-name">{s.product_name}</span>
                        {s.sale_type && (
                          <span className="sale-type-badge">{s.sale_type}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <code className="barcode-text">{s.barcode || "-"}</code>
                    </td>
                    <td>
                      <span className="category-badge">{s.category}</span>
                    </td>
                    <td>
                      <span
                        className={`type-badge ${s.item_type.toLowerCase()}`}
                      >
                        {s.item_type}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="price-value">
                        ₹{sellingPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="price-value buying">
                        ₹{buyingPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="quantity-badge">{s.quantity}</span>
                    </td>
                    <td className="text-right">
                      {profit !== null ? (
                        <span
                          className={`profit-value ${profit >= 0 ? "positive" : "negative"}`}
                        >
                          {profit >= 0 ? "+" : ""}₹{profit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="na-text">-</span>
                      )}
                    </td>
                    <td>
                      <span className="date-text">
                        {new Date(s.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
