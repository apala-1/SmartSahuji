import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/Navbar/UserNavbar";
import "./SalesHistory.css";

export default function SalesHistory() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All"); // All, Sale, Purchase
  const [inventoryMap, setInventoryMap] = useState({}); // Map barcode/name to buying price

  // Fetch inventory data to get buying prices
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/inventory", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("📦 Inventory API Response:", data);

          // Backend returns {inventory: [...]}
          const items = data.inventory || [];
          console.log("📦 Inventory items count:", items.length);

          // Create a map for quick lookup: barcode/name -> buying price
          const map = {};
          items.forEach((item) => {
            console.log("📦 Processing item:", {
              name: item.name,
              barcode: item.barcode,
              buyingPrice: item.buyingPrice,
              sellingPrice: item.sellingPrice,
            });

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
          console.log("📦 Inventory map created:", map);
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
        const res = await fetch("/api/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch sales data");

        const data = await res.json();
        console.log("💰 Sales API Response:", data);
        console.log("💰 First sale item:", data[0]);
        setSales(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [navigate]);

  // Get buying price from inventory
  const getBuyingPrice = (sale) => {
    console.log("🔍 Looking up buying price for:", {
      product_name: sale.product_name,
      barcode: sale.barcode,
    });

    // First try to get from inventory map by barcode
    if (sale.barcode) {
      const barcodeKey = sale.barcode.toUpperCase();
      const inv = inventoryMap[barcodeKey];
      if (inv) {
        console.log("✅ Found by barcode:", barcodeKey, "->", inv.buyingPrice);
        return inv.buyingPrice || 0;
      } else {
        console.log("❌ Not found by barcode:", barcodeKey);
      }
    }

    // Then try by product name
    if (sale.product_name) {
      const nameKey = sale.product_name.toLowerCase();
      const inv = inventoryMap[nameKey];
      if (inv) {
        console.log("✅ Found by name:", nameKey, "->", inv.buyingPrice);
        return inv.buyingPrice || 0;
      } else {
        console.log("❌ Not found by name:", nameKey);
      }
    }

    // Fallback to stored cost (for purchases) or 0
    console.log("⚠️ Using fallback cost:", sale.cost || 0);
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

  // Filter sales based on selected type
  const filteredSales =
    filter === "All" ? sales : sales.filter((s) => s.item_type === filter);

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
      <>
        <UserNavbar />
        <div className="main-content">
          <h2>Sales Ledger</h2>
          <p>Loading sales data...</p>
        </div>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <UserNavbar />
        <div className="main-content">
          <h2>Sales Ledger</h2>
          <p className="error-text">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="main-content">
        <h2>Sales Ledger</h2>

        {/* Filter Dropdown */}
        <div className="filter-bar">
          <label htmlFor="filter">Filter by Type:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>

        {/* Analyze Button */}
        <button className="analyze-btn" onClick={() => navigate("/analytics")}>
          Analyze Data
        </button>

        {/* Table */}
        {filteredSales.length === 0 ? (
          <p>No {filter === "All" ? "" : filter} records found.</p>
        ) : (
          <table className="excel-main-grid">
            <thead>
              <tr>
                <th>Name</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Item Type</th>
                <th>Sale Type</th>
                <th>Selling Price</th>
                <th>Buying Price</th>
                <th>Quantity</th>
                <th>Profit</th>
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
                    <td>{s.product_name}</td>
                    <td>{s.barcode || "-"}</td>
                    <td>{s.category}</td>
                    <td>{s.item_type}</td>
                    <td>{s.sale_type || "-"}</td>
                    <td>₹{sellingPrice.toFixed(2)}</td>
                    <td>₹{buyingPrice.toFixed(2)}</td>
                    <td>{s.quantity}</td>
                    <td
                      style={{
                        color:
                          profit !== null
                            ? profit >= 0
                              ? "#27ae60"
                              : "#c33"
                            : "#666",
                        fontWeight: profit !== null ? "600" : "normal",
                      }}
                    >
                      {profit !== null ? `₹${profit.toFixed(2)}` : "-"}
                    </td>
                    <td>{new Date(s.date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Summary Section */}
        {filteredSales.length > 0 && filter === "Sale" && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666" }}>Total Sales</div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                ₹{totals.totalSales.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666" }}>Total Cost</div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#e67e22",
                }}
              >
                ₹{totals.totalCost.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Total Profit
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: totals.totalProfit >= 0 ? "#27ae60" : "#c33",
                }}
              >
                ₹{totals.totalProfit.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Profit Margin
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: totals.totalProfit >= 0 ? "#27ae60" : "#c33",
                }}
              >
                {totals.totalSales > 0
                  ? ((totals.totalProfit / totals.totalSales) * 100).toFixed(2)
                  : "0.00"}
                %
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
