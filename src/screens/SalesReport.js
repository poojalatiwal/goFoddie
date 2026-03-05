import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

export default function SalesReport() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5001/api/admin/orders", {
      headers: {
        "auth-token": token
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Fetch orders error:", err));
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalPrice || 0),
    0
  );

  return (
    <AdminLayout>
      <h2 className="text-white mb-3">📊 Sales Report</h2>

      <h5 className="text-success mb-4">
        Total Revenue: ₹{totalRevenue}
      </h5>

      <div className="table-responsive">
        <table className="table table-dark table-hover admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o, i) => (
                <tr key={o._id}>
                  <td>{i + 1}</td>
                  <td>{o.user?.name || "User deleted"}</td>
                  <td>₹{o.totalPrice}</td>
                  <td>{o.paymentMethod}</td>
                  <td>
                    <span className={`badge 
                      ${o.status === "Delivered" ? "bg-success" :
                        o.status === "Preparing" ? "bg-warning text-dark" :
                        o.status === "Cancelled" ? "bg-danger" : "bg-secondary"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
