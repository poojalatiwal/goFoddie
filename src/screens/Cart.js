import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";  
import "./Cart.css";

export default function Cart() {
  const [search, setSearch] = useState("");  

  const cart = useCart();
  const dispatch = useDispatchCart();
  const navigate = useNavigate();

  const cartData = Array.isArray(cart)
    ? cart.filter((item) => item && typeof item.price === "number")
    : [];

  const totalPrice = cartData.reduce((total, item) => total + item.price, 0);

  if (cartData.length === 0) {
    return (
      <>
        <Navbar search={search} setSearch={setSearch} /> 
        <div className="empty-cart">🛒 Your Cart is Empty!</div>
      </>
    );
  }

  return (
    <>

      <Navbar
  search={search}
  setSearch={(value) => {
    setSearch(value);
    if (value.trim() !== "") navigate("/");  
  }}
/>

  
      <div className="cart-page">
        <div className="cart-container">
          <h2 className="cart-heading">🛍 Items in Cart</h2>

          <div className="cart-table-wrapper">
            <table className="table table-dark table-hover cart-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Option</th>
                  <th>Amount</th>
                  <th>Remove</th>
                </tr>
              </thead>

              <tbody>
                {cartData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    <td>{item.name}</td>

                    <td>
                      <div className="qty-box">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            dispatch({ type: "DECREMENT_QTY", index })
                          }
                        >
                          -
                        </button>

                        <span className="qty-number">{item.qty}</span>

                        <button
                          className="qty-btn"
                          onClick={() =>
                            dispatch({ type: "INCREMENT_QTY", index })
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>{item.size}</td>

                    <td>₹{item.price}</td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => dispatch({ type: "REMOVE", index })}
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-total-section">
            <h3 className="total-price">
              Total Price: <span>₹{totalPrice}</span>
            </h3>

            <button
              className="payment-btn"
              onClick={() => navigate("/payment")}
            >
              Proceed to Payment
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
