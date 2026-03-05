import "./App.css";
import "../node_modules/bootstrap-dark-5/dist/css/bootstrap-dark.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Home from "./screens/Home";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import MyOrder from "./screens/MyOrder";
import Payment from "./screens/Payment.js";
import Cart from "./screens/Cart";


import AccountPage from "./screens/AccountPage"; 
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./screens/AdminDashboard";
import ManageItems from "./screens/ManageItems";
import ManageUsers from "./screens/ManageUsers";
import SalesReport from "./screens/SalesReport";

import { CartProvider } from "./components/ContextReducer";

function App() {
  return (
    <CartProvider>
      <Router>
        <>

          <ToastContainer position="bottom-right" theme="dark" autoClose={1500} />

          <Routes>

  <Route
    path="/"
    element={
  
        <Home />
    
    }
  />

  <Route
    path="/login"
    element={
        <Login />
    }
  />

  <Route
    path="/signup"
    element={

        <Signup />

    }
  />

  <Route
    path="/myorder"
    element={

        <MyOrder />

    }
  />

  <Route
    path="/profile"
    element={

        <AccountPage />

    }
  />

  <Route
    path="/payment"
    element={

        <Payment />

    }
  />

  <Route
    path="/cart"
    element={

        <Cart />

    }
  />

  <Route
    path="/admin/dashboard"
    element={
      <AdminRoute>

          <AdminDashboard />

      </AdminRoute>
    }
  />

  <Route
    path="/admin/items"
    element={
      <AdminRoute>

          <ManageItems />

      </AdminRoute>
    }
  />

  <Route
    path="/admin/users"
    element={
      <AdminRoute>

          <ManageUsers />

      </AdminRoute>
    }
  />

  <Route
    path="/admin/sales"
    element={
      <AdminRoute>

          <SalesReport />

      </AdminRoute>
    }
  />

</Routes>

        </>
      </Router>
    </CartProvider>
  );
}

export default App;
