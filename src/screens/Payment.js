import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { AddressContext } from "./AddressContext";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import "./Payment.css";

export default function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatchCart();
  const cartData = useCart();

  const { addresses, setAddresses, fetchAddresses } = useContext(AddressContext);

  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [upiId, setUpiId] = useState("");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [newAddress, setNewAddress] = useState({
    name: "",
    mobile: "",
    pincode: "",
    state: "",
    house: "",
    address: "",
    town: "",
  });

  useEffect(() => {
    if (cartData.length === 0) {
      alert("Cart is empty!");
      navigate("/");
      return;
    }

    const total = cartData.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);

    loadAddresses();
  }, [cartData]);

  const loadAddresses = async () => {
    await fetchAddresses();

    const res = await fetch("http://localhost:5001/api/auth/getuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
    });

    const user = await res.json();

    if (user?.location && addresses.length === 0) {
      setAddresses([
        { name: user.name, address: user.location, fromProfile: true },
      ]);
    }
  };

  const handleGetLiveLocation = async () => {
    try {
      const position = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );

      const lat = position.coords.latitude;
      const long = position.coords.longitude;

      const res = await fetch("http://localhost:5001/api/auth/getlocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latlong: { lat, long } }),
      });

      const data = await res.json();

      if (data.location) {
        setNewAddress({ ...newAddress, address: data.location });
      }
    } catch {
      alert("Please allow location access");
    }
  };

  const saveNewAddress = () => {
    const required = ["name", "mobile", "pincode", "state", "house", "address", "town"];
    for (let key of required) {
      if (!newAddress[key]) return alert("Please fill all fields");
    }

    setAddresses([...addresses, newAddress]);
    setNewAddress({
      name: "",
      mobile: "",
      pincode: "",
      state: "",
      house: "",
      address: "",
      town: "",
    });
    setShowAddressForm(false);
  };

  const handlePlaceOrder = async () => {
    if (selectedAddressIndex === "") {
      return alert("Please select an address before placing your order!");
    }

    if (!paymentMethod) return alert("Select a payment method");

    if (paymentMethod === "UPI" && !upiId) return alert("Enter UPI ID");

    if (
      paymentMethod === "Card" &&
      (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)
    ) {
      return alert("Fill card details");
    }

    const selectedAddress = addresses[selectedAddressIndex];
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/auth/placeOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          items: cartData,
          totalPrice,
          address: selectedAddress,
          paymentMethod: paymentMethod === "Cash" ? "COD" : paymentMethod,
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert("Order Placed Successfully!");
        dispatch({ type: "DROP" });
        navigate("/myorder");
      } else {
        alert(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderAddress = (addr) => {
    if (!addr) return "";
    if (addr.fromProfile) return addr.address;

    return `${addr.name}, ${addr.house}, ${addr.address}, ${addr.town}, ${addr.state} - ${addr.pincode} | 📞 ${addr.mobile}`;
  };

  return (
    <>
      <Navbar />

      <div className="payment-page container mt-5 pt-5">
        <h2 className="mb-4 text-center">🧾 Secure Checkout</h2>

        <div className="card p-3 mb-4 shadow-sm">
          <h5>📍 Delivery Address</h5>

          <Form.Select
            className="custom-dropdown mt-2"
            value={selectedAddressIndex}
            onChange={(e) => setSelectedAddressIndex(e.target.value)}
          >
            <option value="" disabled>
              -- Select Address --
            </option>

            {addresses.map((addr, idx) => (
              <option key={idx} value={idx}>
                {renderAddress(addr)}
              </option>
            ))}
          </Form.Select>

          <Button
            variant="outline-success"
            size="sm"
            className="mt-3"
            onClick={() => setShowAddressForm(!showAddressForm)}
          >
            ➕ Add New Address
          </Button>

          {showAddressForm && (
            <div className="mt-3 p-3 bg-dark rounded">
              <Button
                variant="outline-primary"
                size="sm"
                className="w-100 mb-3"
                onClick={handleGetLiveLocation}
              >
                📍 Use Current Location
              </Button>

              {["name", "mobile", "pincode", "state", "house", "address", "town"].map(
                (key, i) => (
                  <Form.Group className="mb-2" key={i}>
                    <Form.Label>{key.toUpperCase()}</Form.Label>
                    <Form.Control
                      value={newAddress[key]}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, [key]: e.target.value })
                      }
                    />
                  </Form.Group>
                )
              )}

              <Button className="btn btn-success mt-2 w-100" onClick={saveNewAddress}>
                Save Address
              </Button>
            </div>
          )}
        </div>

        <div className="card p-3 mb-4 shadow-sm">
          <h5>🛒 Order Summary</h5>

          {cartData.map((item, idx) => (
            <div
              key={idx}
              className="d-flex justify-content-between border-bottom py-2"
            >
              <span>
                {item.name} ({item.size} × {item.qty})
              </span>
              <span>₹{item.price}</span>
            </div>
          ))}

          <h4 className="mt-3 text-success text-end">Total: ₹{totalPrice}</h4>
        </div>

        <div className="card p-3 mb-4 shadow-sm">
          <h5>💰 Payment Method</h5>

          <Form.Select
            className="custom-dropdown mt-2 mb-3"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="" disabled>
              -- Select Payment Method --
            </option>
            <option value="Cash">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </Form.Select>

          {paymentMethod === "UPI" && (
            <Form.Control
              placeholder="Enter UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          )}

          {paymentMethod === "Card" && (
            <>
              <Form.Control
                className="mb-2"
                placeholder="Card Number"
                onChange={(e) =>
                  setCardData({ ...cardData, number: e.target.value })
                }
              />
              <Form.Control
                className="mb-2"
                placeholder="Card Holder Name"
                onChange={(e) =>
                  setCardData({ ...cardData, name: e.target.value })
                }
              />
              <div className="d-flex gap-2">
                <Form.Control
                  placeholder="MM/YY"
                  onChange={(e) =>
                    setCardData({ ...cardData, expiry: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="CVV"
                  type="password"
                  onChange={(e) =>
                    setCardData({ ...cardData, cvv: e.target.value })
                  }
                />
              </div>
            </>
          )}
        </div>

        <Button
          className="payment-btn-main"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay & Place Order"}
        </Button>
      </div>

      <Footer />
    </>
  );
}
