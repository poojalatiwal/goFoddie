import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Account.css";

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    pincode: "",
    state: "",
    house: "",
    address: "",
    town: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAddresses();
  }, []);


  const fetchAddresses = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/auth/addresses", {
        headers: { "auth-token": token },
      });
      setAddresses(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const handleGetLiveLocation = async () => {
    try {
      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }

      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const lat = position.coords.latitude;
      const long = position.coords.longitude;

      const res = await axios.post(
        "http://localhost:5001/api/auth/getlocation",
        { latlong: { lat, long } }
      );

      if (res.data.location) {
        setFormData((prev) => ({
          ...prev,
          address: res.data.location,
        }));
      } else {
        alert("Unable to fetch live address");
      }
    } catch (err) {
      console.error("Live location error:", err);
      alert("Please allow location access");
    }
  };


  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile || !formData.address) {
      alert("Please fill required fields!");
      return;
    }

    try {
      if (editingIndex !== null) {
        const id = addresses[editingIndex]._id;
        await axios.put(
          `http://localhost:5001/api/auth/addresses/${id}`,
          formData,
          { headers: { "auth-token": token } }
        );
      } else {
        await axios.post(
          "http://localhost:5001/api/auth/addresses",
          formData,
          { headers: { "auth-token": token } }
        );
      }

      fetchAddresses();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };


  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      pincode: "",
      state: "",
      house: "",
      address: "",
      town: "",
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setFormData(addresses[index]);
    setShowForm(true);
  };

  const renderAddress = (addr) =>
    `${addr.name}, ${addr.house}, ${addr.address}, ${addr.town}, ${addr.state} - ${addr.pincode} | 📞 ${addr.mobile}`;



  return (
    <div className="p-4" id="addresses">
      <h4 className="mb-3">📍 Saved Addresses</h4>

      {addresses.length === 0 ? (
        <p className="text-muted">No addresses saved yet.</p>
      ) : (
        addresses.map((addr, i) => (
          <div key={i} className="card shadow-sm p-3 mt-2">
            <p className="mb-2">{renderAddress(addr)}</p>
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => handleEditClick(i)}
            >
              ✏️ Edit
            </button>
          </div>
        ))
      )}

      <button
        className="btn btn-primary mt-3"
        onClick={() => {
          if (!showForm) resetForm();
          setShowForm(!showForm);
        }}
      >
        {showForm ? "Cancel" : "➕ Add New Address"}
      </button>

      {showForm && (
        <div className="card shadow-sm p-3 mt-3">

          <button
            type="button"
            className="btn btn-outline-primary w-100 mb-3"
            onClick={handleGetLiveLocation}
          >
            📍 Use Current Location
          </button>

          {[
            { label: "Name", key: "name" },
            { label: "Mobile", key: "mobile" },
            { label: "Pincode", key: "pincode" },
            { label: "State", key: "state" },
            { label: "House / Block", key: "house" },
            { label: "Street / Area", key: "address" },
            { label: "Locality / Town", key: "town" },
          ].map((f, i) => (
            <div key={i} className="mb-2">
              <label className="form-label">{f.label}</label>
              <input
                type="text"
                className="form-control"
                value={formData[f.key]}
                onChange={(e) =>
                  setFormData({ ...formData, [f.key]: e.target.value })
                }
              />
            </div>
          ))}

          <button className="btn btn-success w-100 mt-2" onClick={handleSubmit}>
            {editingIndex !== null ? "💾 Save Changes" : "💾 Save Address"}
          </button>
        </div>
      )}
    </div>
  );
}
