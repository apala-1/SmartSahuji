import React, { useState } from "react";
import UserNavbar from "../../components/Navbar/UserNavbar";
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
import "../ShowData/SalesHistory.css";

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
    <>
      <div className="main-content">
        <h2>Sales Analytics</h2>

        <div className="filters">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <button className="analyze-btn" onClick={fetchData}>
            Analyze
          </button>
        </div>

        {!data && <p>Please click Analyze to generate report</p>}

        {data && (
          <div className="analytics-summary">
            <p>Total Revenue: {data.summary.total_revenue}</p>
            <p>Total Profit: {data.summary.total_profit}</p>
            <p>Total Orders: {data.summary.total_orders}</p>
          </div>
        )}

        {data && (
          <>
            <h3>Trend (Revenue vs Profit)</h3>
            <div className="chart-container small">
              <ResponsiveContainer>
                <LineChart data={data.trend_series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" />
                  <Line type="monotone" dataKey="profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {data && (
          <>
            <h3>Revenue vs Profit by Category</h3>
            <div className="chart-container small">
              <ResponsiveContainer>
                <BarChart data={data.category_stats} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" />
                  <Bar dataKey="profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {data && (
          <>
            <h3>Profit by Category</h3>
            <div className="chart-container small">
              <ResponsiveContainer>
                <BarChart data={data.category_stats} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {data && (
          <>
            <h3>Loss by Category</h3>
            <div className="chart-container small">
              <ResponsiveContainer>
                <BarChart data={data.category_stats} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="loss" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {data && (
          <>
            <h3>Profit Margin by Category</h3>
            <div className="chart-container small">
              <ResponsiveContainer>
                <BarChart data={data.category_stats} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit_margin" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {data && (
          <>
            <h3>Top 5 Products by Profit</h3>
            <ul>
              {data.top_products.map((p) => (
                <li key={p.product}>
                  {p.product} - Profit: {p.profit}
                </li>
              ))}
            </ul>

            <h3>Top 5 Products by Profit Margin</h3>
            <ul>
              {data.top_margin_products.map((p) => (
                <li key={p.product}>
                  {p.product} - Margin: {(p.profit_margin * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
