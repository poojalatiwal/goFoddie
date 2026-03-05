import React from "react";
import { NavLink, useNavigate } from "react-router-dom";   
import "./Admin.css";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="admin-navbar navbar navbar-expand-lg">
      <div className="container-fluid">

        <NavLink className="navbar-brand fs-1 fst-italic text-success" to="/admin/dashboard">
          GoFoodiee
        </NavLink>

        <div className="navbar-collapse collapse show">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-3">

            <li className="nav-item">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/admin/items"
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                Manage Items
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                Users
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/admin/sales"
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                Sales Report
              </NavLink>
            </li>
          </ul>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
