import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar';

export default function Signup() {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    geolocation: "",
    role: "user"
  });

  const [showPassword, setShowPassword] = useState(false);
  let navigate = useNavigate()

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      let navLocation = () => {
        return new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej);
        });
      }

      let { coords } = await navLocation();
      let latitude = coords.latitude;
      let longitude = coords.longitude;

      const response = await fetch("http://localhost:5001/api/auth/getlocation", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latlong: { lat: latitude, long: longitude } })
      });

      const { location } = await response.json();
      setCredentials({ ...credentials, geolocation: location });
    } catch (err) {
      console.error("Location error:", err);
      alert("❌ Unable to fetch location. Please allow location access in browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5001/api/auth/createuser", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        location: credentials.geolocation,
        role: credentials.role
      })
    });
    const json = await response.json()
    if (json.success) {
      localStorage.setItem('token', json.token)
      localStorage.setItem('role', json.role)
      navigate("/login")
    }
    else {
      alert(json.error || "Enter Valid Credentials")
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

 return (
  <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>

    <div
      style={{
        backgroundImage: 'url("https://images.pexels.com/photos/19834447/pexels-photo-19834447.jpeg")',
        position: "absolute",
        inset: 0,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(2px)",
        transform: "scale(1.1)",
        zIndex: 1
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 2
      }}
    />

    <div style={{ position: "relative", zIndex: 3 }}>
      <Navbar />

      <div className="container">
        <form
          className="w-50 m-auto mt-5 border bg-dark border-success rounded p-4"
          onSubmit={handleSubmit}
        >

          <div className="m-3">
            <label className="form-label text-white">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={credentials.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="m-3">
            <label className="form-label text-white">Email address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={credentials.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="m-3">
            <label className="form-label text-white">Address</label>
            <input
              type="text"
              className="form-control"
              name="geolocation"
              value={credentials.geolocation}
              onChange={onChange}
              placeholder="Click below to fetch address"
            />
          </div>

          <div className="m-3">
            <button
              type="button"
              onClick={handleClick}
              className="btn btn-success"
            >
              📍 Get Current Location
            </button>
          </div>
          
          <div className="m-3">
            <label className="form-label text-white">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={credentials.password}
                onChange={onChange}
                name="password"
                required
              />
              <span
                className="input-group-text"
                style={{
                  backgroundColor: "#212529",
                  borderLeft: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  style={{
                    color: showPassword ? "#0d6efd" : "#6c757d",
                    fontSize: "1.2rem",
                  }}
                ></i>
              </span>
            </div>
          </div>

          <button type="submit" className="m-3 btn btn-success">
            Submit
          </button>

          <Link to="/login" className="m-3 mx-1 btn btn-danger">
            Already a user
          </Link>
        </form>
      </div>
    </div>
  </div>
);
}