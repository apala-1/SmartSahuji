import React, { useState } from "react";
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
} from "recharts";
import "./Analytics.css";

export default function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
        <button className="back-btn" onClick={() => navigate("/sales-history")}>
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
            <input
              id="category"
              type="text"
              placeholder="e.g., Electronics"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-input"
            />
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
                ₹
                {data.summary.total_revenue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="stat-card profit">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <p className="stat-label">Total Profit</p>
              <h3 className="stat-value">
                ₹
                {data.summary.total_profit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="stat-card orders">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <h3 className="stat-value">
                {data.summary.total_orders.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
          <div className="stat-card margin">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Profit Margin</p>
              <h3 className="stat-value">
                {data.summary.total_revenue > 0
                  ? (
                      (data.summary.total_profit / data.summary.total_revenue) *
                      100
                    ).toFixed(2)
                  : "0.00"}
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
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Charts Grid */}
          <div className="charts-grid">
            {/* Revenue vs Profit by Category */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>💼 Revenue vs Profit by Category</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.category_stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      style={{ fontSize: "0.8rem" }}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: "0.8rem" }} />
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
                    <Bar
                      dataKey="revenue"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="profit"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit by Category */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>📊 Profit by Category</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.category_stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      style={{ fontSize: "0.8rem" }}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: "0.8rem" }} />
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
                    <Bar
                      dataKey="profit"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Loss by Category */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>📉 Loss by Category</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.category_stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      style={{ fontSize: "0.8rem" }}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: "0.8rem" }} />
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
                    <Bar dataKey="loss" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit Margin by Category */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>💹 Profit Margin by Category</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.category_stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      style={{ fontSize: "0.8rem" }}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: "0.8rem" }} />
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
                    <Bar
                      dataKey="profit_margin"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Products Section */}
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
                        ₹
                        {p.profit.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
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
