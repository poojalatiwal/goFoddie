import React, { useState, useEffect } from "react";

export default function ProfileDetails({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5001/api/auth/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        onUpdate(data.user);
        setIsEditing(false);
        alert("✅ Profile updated");
      } else {
        alert("❌ Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error");
    }
  };

  return (
    <div className="profile-edit-page p-4">

      <h3 className="mb-1">Profile Details</h3>
      <p className="text-muted mb-4">Manage your personal information</p>

      <div className="profile-edit-card">


        <div className="mb-4">
          <label className="profile-label">NAME</label>
          <input
            className="form-control profile-input"
            disabled={!isEditing}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label className="profile-label">EMAIL</label>
          <input
            className="form-control profile-input"
            disabled={!isEditing}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label className="profile-label">PHONE</label>
          <input
            className="form-control profile-input"
            disabled={!isEditing}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label className="profile-label">GENDER</label>
          <select
            className="form-select profile-input"
            disabled={!isEditing}
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="d-flex justify-content-end gap-3 mt-4">

          {!isEditing && (
            <button
              className="btn btn-outline-success px-4"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}

          {isEditing && (
            <>
              <button
                className="btn btn-outline-light"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    gender: user.gender || "",
                  });
                }}
              >
                Cancel
              </button>

              <button
                className="btn btn-success px-5"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
