import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false);
  let navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5001/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: credentials.email, 
        password: credentials.password
      })
    });
  
    const json = await response.json();
    console.log(json);
  
    if (json.success) {

  localStorage.setItem("userEmail", credentials.email);
  localStorage.setItem("token", json.authToken);
  localStorage.setItem("role", json.role);

  localStorage.setItem("cartUser", credentials.email);

  if (json.role === "admin") {
    navigate("/admin/dashboard");
  } else {
    navigate("/");
  }

    } else {
      alert(json.error || "Enter Valid Credentials");
    }
  }
  

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
  <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
    <div
      style={{
        backgroundImage: 'url("https://images.pexels.com/photos/35532827/pexels-photo-35532827.jpeg")',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(2px)",
        transform: "scale(1.1)",
        zIndex: 1,
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 2,
      }}
    />

    <div style={{ position: "relative", zIndex: 3 }}>
      <Navbar />

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <form
          className="w-50 border bg-dark border-success rounded p-4"
          onSubmit={handleSubmit}
        >
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
            Login
          </button>

          <Link to="/signup" className="m-3 mx-1 btn btn-danger">
            New User
          </Link>
        </form>
      </div>
    </div>
  </div>
);
}