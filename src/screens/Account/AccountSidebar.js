import React from "react";
import "./AccountSidebar.css";

export default function AccountSidebar({ activeTab, setActiveTab }) {
  const tabs = [
    "Overview",
    "Orders",
    "Profile",
    "Addresses",
    "Help",
    "Delete Account"
  ];

  return (
    <div className="account-sidebar col-md-3">
      <h5 className="fw-bold mb-4">Account</h5>

      {tabs.map((tab) => (
        <div
          key={tab}
          className={`account-tab ${activeTab === tab ? "active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
