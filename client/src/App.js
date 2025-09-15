import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [insights, setInsights] = useState({
    customers: 0,
    orders: [],
    revenue: 0,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const backendBaseURL = "https://shopify-insight-service.onrender.com"; // Change if using deployed backend

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    try {
      const res = await axios.post(`${backendBaseURL}/login`, {
        email,
        password,
      });
      setToken(res.data.token);
      setErrorMsg("");
    } catch {
      setErrorMsg("Login failed. Check credentials.");
    }
  };

  const fetchInsights = async () => {
    if (!tenantId) {
      setErrorMsg("Please enter a Tenant ID.");
      return;
    }
    try {
      const res = await axios.get(`${backendBaseURL}/insights/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedOrders = res.data.orders.map((order) => ({
        ...order,
        date: new Date(order.date).toLocaleDateString(),
      }));

      setInsights({
        customers: res.data.customers,
        orders: formattedOrders,
        revenue: res.data.revenue.toFixed(2),
      });
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to fetch insights. Check Tenant ID and token.");
    }
  };

  const handleLogout = () => {
    setToken("");
    setTenantId("");
    setInsights({ customers: 0, orders: [], revenue: 0 });
    setEmail("");
    setPassword("");
    setErrorMsg("");
  };

  return (
    <div className="App">
      {!token ? (
        <div className="login-container">
          <h2>Login to Xeno Dashboard</h2>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
          {errorMsg && (
            <p style={{ color: "red", marginTop: "12px" }}>{errorMsg}</p>
          )}
        </div>
      ) : (
        <div className="dashboard">
          <div className="dashboard-header">
            <h1>Xeno Insights Dashboard</h1>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="input-row">
            <input
              className="tenant-input"
              type="text"
              placeholder="Enter Tenant ID"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            />
            <button className="fetch-button" onClick={fetchInsights}>
              Load Insights
            </button>
          </div>

          {errorMsg && (
            <p style={{ color: "red", marginBottom: "20px" }}>{errorMsg}</p>
          )}

          <div className="metrics">
            <div className="metric-card">
              <div className="metric-title">Total Customers</div>
              <div className="metric-value">{insights.customers}</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Total Revenue</div>
              <div className="metric-value">${insights.revenue}</div>
            </div>
          </div>

          <div
            className="chart-container"
            style={{ height: 350, width: "100%" }}
          >
            <ResponsiveContainer>
              <LineChart data={insights.orders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#008060"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
