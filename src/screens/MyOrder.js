import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyOrder() {
  const [orders, setOrders] = useState([]);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/myOrderData", {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);


  const downloadInvoice = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/auth/invoice/${orderId}`,
        {
          method: "GET",
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (!res.ok) {
        alert("Invoice not found");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Invoice download failed", err);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/auth/cancelOrder/${id}`,
        {
          method: "DELETE",
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("✅ Order cancelled");
        fetchMyOrders();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Cancel order error:", err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="myorders-page">
        <div className="container text-light">

          <h2 className="mb-4">📦 My Orders</h2>

          {orders.length === 0 && <p>No orders found.</p>}

          {orders.map((order, index) => (
            <div
              key={order._id}
              className="card bg-dark text-light p-3 mb-4 shadow"
            >

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h5>Order #{index + 1}</h5>
                  <p className="mb-1">
                    Date:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                  <p className="mb-1">Payment: {order.paymentMethod}</p>
                  <p className="mb-1">Total: ₹{order.totalPrice}</p>
                </div>

                <span className="badge bg-warning text-dark p-2">
                  {order.status}
                </span>
              </div>

              <hr />

              {order.items.map((item, i) => (
                <div key={i} className="d-flex justify-content-between">
                  <span>
                    {item.name} ({item.size}) × {item.quantity}
                  </span>
                  <span>₹{item.price}</span>
                </div>
              ))}

              <hr />

              <div className="d-flex gap-2 mt-2 flex-wrap">
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => downloadInvoice(order._id)}
                >
                  🧾 Download Invoice
                </button>

                {(order.status === "Preparing" ||
                  order.status === "pending") && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
