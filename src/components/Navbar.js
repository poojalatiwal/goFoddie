import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useCart } from "./ContextReducer";
import "./Navbar.css"; 

export default function Navbar({ search = "", setSearch = () => {} }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [focused, setFocused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const items = useCart();

  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "user").toLowerCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const hiddenPages = [
    "/login",
    "/signup",
    "/payment",
    "/profile",
    "/account",
    "/myorder",
  ];

  const hideSearch =
    hiddenPages.includes(location.pathname) ||
    location.pathname.startsWith("/admin");

 const isActive = (path) =>
  location.pathname === path ? "nav-active" : "nav-inactive";

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light app-navbar fixed-top">
        <div className="container-fluid">
          <Link
            className="navbar-brand fs-1 fst-italic text-success"
            to={role === "admin" ? "/admin/dashboard" : "/"}
          >
            GoFoodiee
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isCollapsed ? "" : "show"}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {role === "user" && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link fs-5 mx-3 ${isActive("/")}`} to="/">
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link fs-5 mx-3 ${isActive("/myorder")}`}
                      to="/myorder"
                    >
                      My Orders
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {!token ? (
              <form className="d-flex">
                <Link className="btn btn-outline-success mx-1" to="/login">
                  Login
                </Link>
                <Link className="btn btn-success text-white mx-1" to="/signup">
                  Signup
                </Link>
              </form>
            ) : (
              <div className="d-flex align-items-center">
                {role === "user" && (
                  <button
                    className="btn btn-outline-success mx-2"
                    onClick={() => navigate("/cart")}
                  >
                    <Badge color="secondary" badgeContent={items.length}>
                      <ShoppingCartIcon />
                    </Badge>{" "}
                    Cart
                  </button>
                )}

                <button
                  className="btn btn-outline-primary mx-2 d-flex align-items-center"
                  onClick={() =>
                    navigate(role === "admin" ? "/admin/profile" : "/profile")
                  }
                >
                  <AccountCircleIcon className="me-1" />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {!hideSearch && role === "user" && (
        <div className={`search-wrapper ${focused ? "active" : ""}`}>
          <div className="nav-search-box">
            <input
              className="nav-search-input"
              type="search"
              placeholder="🔍 Search food, category..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value.toLowerCase())
              }
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setSearch(search.trim().toLowerCase());
                }
              }}
            />

            {search && (
              <span
                className="clear-btn"
                onClick={() => setSearch("")}
              >
                ✖
              </span>
            )}

            <button
              className="btn btn-primary nav-search-btn"
              onClick={() => setSearch(search.trim().toLowerCase())}
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
