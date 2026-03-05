import React from "react";
import "./Account.css";

export default function HelpSection() {
  return (
    <div className="help-wrapper">
      <h3 className="help-title">🛟 Help & Support</h3>
      <p className="help-subtitle">
        If you face any issues, feel free to reach out. We’re here to help you.
      </p>

      <div className="help-card">
        <div className="help-item">
          <span>📧 Email</span>
          <p>support@fooddelivery.com</p>
        </div>

        <div className="help-item">
          <span>📞 Phone</span>
          <p>+91 98765 43210</p>
        </div>

        <div className="help-item">
          <span>⏰ Working Hours</span>
          <p>9:00 AM – 9:00 PM</p>
        </div>
      </div>
    </div>
  );
}
