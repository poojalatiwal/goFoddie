import React, { useState } from "react";
import "./Account.css";
import { useNavigate } from "react-router-dom";

export default function DeleteAccount() {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== "delete my account") {
      alert('Please type "delete my account" exactly to continue.');
      return;
    }

    const confirmBox = window.confirm(
      "⚠️ This will permanently delete your account and all your data. Do you want to continue?"
    );

    if (!confirmBox) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5001/api/auth/deleteAccount", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Account deleted successfully");
        localStorage.clear();
        navigate("/signup");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-wrapper">
      <h3 className="delete-title">⚠️ Delete Account</h3>
      <p className="delete-warning">
        This action is permanent and cannot be undone.
      </p>

      <div className="delete-card">
        <label>
          Type <span style={{ color: "#ef4444" }}>"delete my account"</span> to confirm:
        </label>

        <input
          type="text"
          placeholder="delete my account"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />

        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}
