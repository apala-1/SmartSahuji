import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  defs,
  linearGradient,
  stop,
} from "recharts";
import "./Analytics.css";

export default function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");

  // Format number with commas and decimals
  const formatNumber = (num, decimals = 2) => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const fetchData = () => {
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    let url = `http://localhost:8000/analytics?period=${period}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    if (category) url += `&category=${category}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  };

  return (
    <div className="analytics-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">📊 Sales Analytics</h1>
          <p className="page-subtitle">
            Comprehensive insights into your business performance
          </p>
        </div>
        <button className="back-btn" onClick={() => navigate("/sales")}>
          ← Back to History
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <h3 className="filters-title">🔍 Analysis Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="period">Time Period</label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="daily">📆 Daily</option>
              <option value="weekly">📅 Weekly</option>
              <option value="monthly">📆 Monthly</option>
              <option value="yearly">🗓️ Yearly</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Books">Books</option>
              <option value="Household">Household</option>
              <option value="Beauty">Beauty</option>
              <option value="Sports">Sports</option>
              <option value="Toys">Toys</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button className="analyze-btn" onClick={fetchData}>
          📈 Generate Report
        </button>
      </div>

      {/* Empty State */}
      {!data && (
        <div className="empty-analytics">
          <div className="empty-icon">📊</div>
          <h3>Ready to Analyze Your Data</h3>
          <p>
            Configure your filters above and click "Generate Report" to view
            insights
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {data && (
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">
                ₹{formatNumber(data.summary.total_revenue)}
              </h3>
            </div>
          </div>
          <div className="stat-card profit">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <p className="stat-label">Total Profit</p>
              <h3 className="stat-value">
                ₹{formatNumber(data.summary.total_profit)}
              </h3>
            </div>
          </div>
          <div className="stat-card orders">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <h3 className="stat-value">
                {formatNumber(data.summary.total_orders, 0)}
              </h3>
            </div>
          </div>
          <div className="stat-card margin">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Profit Margin</p>
              <h3 className="stat-value">
                {formatNumber(
                  data.summary.total_revenue > 0
                    ? (data.summary.total_profit / data.summary.total_revenue) *
                        100
                    : 0,
                )}
                %
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {data && (
        <>
          {/* Trend Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>📈 Revenue vs Profit Trend</h3>
              <p className="chart-subtitle">Track your performance over time</p>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.trend_series}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="profitGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="period"
                    stroke="#64748b"
                    style={{ fontSize: "0.85rem" }}
                  />
                  <YAxis stroke="#64748b" style={{ fontSize: "0.85rem" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.9rem", fontWeight: "600" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    fill="url(#revenueGradient)"
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    fill="url(#profitGradient)"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Charts */}
          <div className="charts-grid">
            {["Revenue vs Profit", "Profit", "Loss", "Profit Margin"].map(
              (title, index) => {
                const keyMap = {
                  "Revenue vs Profit": ["revenue", "profit"],
                  Profit: ["profit"],
                  Loss: ["loss"],
                  "Profit Margin": ["profit_margin"],
                };
                const colors = {
                  revenue: "#3b82f6",
                  profit: "#10b981",
                  loss: "#ef4444",
                  profit_margin: "#8b5cf6",
                };

                return (
                  <div className="chart-card" key={index}>
                    <div className="chart-header">
                      <h3>
                        {title === "Revenue vs Profit"
                          ? "💼"
                          : title === "Profit"
                            ? "📊"
                            : title === "Loss"
                              ? "📉"
                              : "💹"}{" "}
                        {title} by Category
                      </h3>
                    </div>
                    <div className="chart-wrapper">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.category_stats}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="category"
                            stroke="#64748b"
                            style={{ fontSize: "0.8rem" }}
                          />
                          <YAxis
                            stroke="#64748b"
                            style={{ fontSize: "0.8rem" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: "0.85rem",
                              fontWeight: "600",
                            }}
                          />
                          {keyMap[title].map((k) => (
                            <Bar
                              key={k}
                              dataKey={k}
                              fill={colors[k]}
                              radius={[8, 8, 0, 0]}
                              animationDuration={1500}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* Top Products */}
          <div className="top-products-grid">
            <div className="top-products-card">
              <div className="card-header">
                <h3>🏆 Top 5 Products by Profit</h3>
              </div>
              <div className="products-list">
                {data.top_products.map((p, index) => (
                  <div key={p.product} className="product-item">
                    <div className="product-rank">#{index + 1}</div>
                    <div className="product-details">
                      <span className="product-name">{p.product}</span>
                      <span className="product-profit positive">
                        ₹{formatNumber(p.profit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="top-products-card">
              <div className="card-header">
                <h3>💎 Top 5 Products by Margin</h3>
              </div>
              <div className="products-list">
                {data.top_margin_products.map((p, index) => (
                  <div key={p.product} className="product-item">
                    <div className="product-rank">#{index + 1}</div>
                    <div className="product-details">
                      <span className="product-name">{p.product}</span>
                      <span className="product-margin">
                        {(p.profit_margin * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
