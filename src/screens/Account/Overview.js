import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Overview({ user, onEditProfile }) {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    bio: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState("https://via.placeholder.com/150");


  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        bio: user.bio || "",
      });

      if (user.profilePhoto) {
        setPreview(
          user.profilePhoto.startsWith("data:image")
            ? user.profilePhoto
            : `http://localhost:5001${user.profilePhoto}`
        );
      }
    }
  }, [user]);


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoFile(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return alert("Select an image first");

    try {
      const res = await fetch(
        "http://localhost:5001/api/auth/profile/photoBase64",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify({ photoBase64: photoFile }),
        }
      );

      const data = await res.json();

      if (data.success) {
        onEditProfile(data.user);
        alert("✅ Photo updated");
      } else alert("❌ Upload failed");
    } catch (err) {
      console.error(err);
      alert("Upload error");
    }
  };



  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();

      if (data.success) {
        onEditProfile(data.user);
        setShowEditForm(false);
        alert("✅ Profile updated");
      } else alert("❌ Update failed");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };


return (
  <div className="p-4">
    <h4 className="mb-4">Welcome, {user?.name} 👋</h4>

    <div className="profile-main-card">


      <div className="profile-top-horizontal">


        <div className="profile-left">
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>

          <button
            className="btn btn-outline-success mt-2"
            onClick={() => setShowEditForm((prev) => !prev)}
          >
            {showEditForm ? "Close Edit" : "Edit Profile"}
          </button>
        </div>

   
        <div className="profile-right">
          <div className="profile-image-box">
            <img src={preview} alt="Profile" />
          </div>

          <input
            type="file"
            accept="image/*"
            className="form-control mt-2"
            onChange={handlePhotoChange}
          />

          <button
            className="btn btn-success mt-2 w-100"
            onClick={handlePhotoUpload}
          >
            Upload New Photo
          </button>
        </div>

      </div>

      <hr />


      <div className="profile-details-vertical">
        <div><span>Email</span><p>{user?.email}</p></div>
        <div><span>Phone</span><p>{user?.phone || "Not added"}</p></div>
        <div><span>Gender</span><p>{user?.gender || "Not specified"}</p></div>
      </div>

    
      {showEditForm && (
        <div className="profile-edit-form mt-4">

          {["name", "email", "phone"].map((field) => (
            <div className="mb-3" key={field}>
              <label className="form-label text-light">
                {field.toUpperCase()}
              </label>
              <input
                className="form-control"
                value={editData[field]}
                onChange={(e) =>
                  setEditData({ ...editData, [field]: e.target.value })
                }
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label text-light">Gender</label>
            <select
              className="form-select"
              value={editData.gender}
              onChange={(e) =>
                setEditData({ ...editData, gender: e.target.value })
              }
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <button className="btn btn-success mt-2" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      )}
    </div>

  </div>
);
}
