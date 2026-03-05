import React from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0dff" }}>
      <AdminNavbar />

      <div className="container py-4">
        {children}
      </div>
    </div>
  );
}
