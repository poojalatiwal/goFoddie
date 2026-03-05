import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [weeklyData, setWeeklyData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5001/api/admin/sales", {
      headers: { "auth-token": token }
    })
      .then(res => res.json())
      .then(data => {

        const last7 = Array.isArray(data) ? data.slice(-7) : [];
        setWeeklyData(last7.map(d => ({
          date: d._id,
          sales: d.totalSales,
          orders: d.orders
        })));
      })
      .catch(err => console.error("Weekly sales error:", err));
  }, []);

  return (
    <AdminLayout>
      <h2 className="admin-title">Admin Dashboard</h2>

      <div className="row g-4 dashboard-grid mb-4">

        <div className="col-md-4">
          <div className="admin-card" onClick={() => navigate("/admin/users")}>
            <h5>👥 Manage Users</h5>
            <p>View & control all registered users</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="admin-card" onClick={() => navigate("/admin/items")}>
            <h5>🍔 Manage Items</h5>
            <p>Add, edit or delete food items</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="admin-card" onClick={() => navigate("/admin/sales")}>
            <h5>📊 Sales Report</h5>
            <p>Orders, metrics & revenue analytics</p>
          </div>
        </div>

      </div>


      <div className="admin-graph-card">
        <h4 className="mb-3">📈 Weekly Sales Report</h4>

        {weeklyData.length === 0 ? (
          <p className="text-muted">No sales data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </AdminLayout>
  );
}
