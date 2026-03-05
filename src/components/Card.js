import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatchCart, useCart } from "./ContextReducer";
import { toast } from "react-toastify";
import "./Card.css";

export default function Card(props) {
  const data = useCart();
  const dispatch = useDispatchCart();
  const navigate = useNavigate();

  const foodItem = props.item;


  const options = foodItem?.options?.[0] || {};


  const priceOptions = Object.keys(options).filter(
    (key) => key !== "_id" && options[key] !== undefined
  );

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);


  useEffect(() => {
    if (priceOptions.length > 0) {
      setSize(priceOptions[0]);
    }
  }, [foodItem]);


  useEffect(() => {
    if (size && options[size]) {
      setFinalPrice(qty * Number(options[size]));
    }
  }, [qty, size, options]);

  const handleAddToCart = () => {
    if (!localStorage.getItem("token")) {
      toast.info("🔐 Please login to add items");
      navigate("/login");
      return;
    }

    const unitPrice = Number(options[size]);

    const existingFood = data.find(
      (item) => item.id === foodItem._id && item.size === size
    );

    if (existingFood) {
      dispatch({
        type: "UPDATE",
        id: foodItem._id,
        qty,
        price: unitPrice * qty,
      });
    } else {
      dispatch({
        type: "ADD",
        item: {
          id: foodItem._id,
          name: foodItem.name,
          qty,
          size,
          singlePrice: unitPrice,
          price: unitPrice * qty,
          img: props.ImgSrc,
        },
      });
    }

    toast.success(`🛒 ${foodItem.name} added to cart`);
  };

  return (
    <div className="food-card">
      <img src={props.ImgSrc} alt={props.foodName} />

      <div className="food-card-body">
        <h6>{props.foodName}</h6>

        <div className="food-controls">

          <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
            {[1,2,3,4,5,6].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>


          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {priceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>


          <span>₹{finalPrice}/-</span>
        </div>

        <button onClick={handleAddToCart}>Add to Cart</button>
      </div>
    </div>
  );
}
