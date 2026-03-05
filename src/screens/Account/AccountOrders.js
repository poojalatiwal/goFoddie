import React, { useEffect, useState } from "react";
import { useDispatchCart } from "../../components/ContextReducer";
import { useNavigate } from "react-router-dom";
import "./Account.css";

export default function AccountOrders() {
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatchCart();
  const navigate = useNavigate();

  const fetchMyOrders = async () => {
    const res = await fetch("http://localhost:5001/api/auth/myOrderData", {
      headers: {
        "auth-token": localStorage.getItem("token"),
      },
    });

    const data = await res.json();
    if (data.success) setOrders(data.orders);
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

const orderAgain = async (items) => {
  dispatch({ type: "DROP" });

  items.forEach((item) => {
    dispatch({
      type: "ADD",
      item: {
        id: item._id || item.id,      
        name: item.name,
        size: item.size,
        qty: item.quantity,
        price: item.price,        
        singlePrice: item.price,
        img: item.img || ""
      }
    });
  });

  navigate("/cart");
};

  const downloadInvoice = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/auth/invoice/${id}`, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      if (!res.ok) return alert("Failed to download invoice");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="account-orders text-light">
      <h3 className="account-orders-title">📦 My Orders</h3>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order, index) => (
        <div key={order._id} className="order-card">
          
          <div className="order-top">
            <div>
              <h5>Order #{index + 1}</h5>
              <p>{new Date(order.orderDate).toLocaleString()}</p>
              <p>Payment: {order.paymentMethod}</p>
              <p>Total: ₹{order.totalPrice}</p>
            </div>

            <span className={`order-status ${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>

          <hr />

          {order.items.map((item, i) => (
            <div key={i} className="order-item">
              <span>{item.name} ({item.size}) × {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          ))}

          <div className="order-actions">
            <button
              className="btn btn-outline-info btn-sm"
              onClick={() => downloadInvoice(order._id)}
            >
              🧾 Invoice
            </button>

            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => orderAgain(order.items)}
            >
              🔁 Order Again
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
