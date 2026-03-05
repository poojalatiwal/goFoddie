import React from "react";

export default function Modal({ children }) {
  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#111"
    }}>
      {children}
    </div>
  );
}
