import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import AdminCard from "../components/AdminCard";
import AddFoodForm from "../components/AddFoodForm";
import "./Admin.css";

const API = "http://localhost:5001/api/admin";

export default function ManageItems() {
  const [foodCat, setFoodCat] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchItems = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5001/api/auth/foodData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log("🟡 RAW RESPONSE FROM /foodData:", data);
console.log("🟢 FOOD ITEMS:", data[0]);
console.log("🔵 CATEGORIES:", data[1]);

      setFoodItems(data[0] || []);
      setFoodCat(data[1] || []);
    } catch (err) {
      console.error("❌ Items fetch error:", err);
      alert("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`${API}/food/${id}`, {
        method: "DELETE",
        headers: {
          "auth-token": token,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setFoodItems((prev) => prev.filter((item) => item._id !== id));
        alert("✅ Item deleted");
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Server error while deleting");
    }
  };


  const handleEdit = async (updatedItem) => {
    try {
      const res = await fetch(`${API}/food/${updatedItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(updatedItem),
      });

      const data = await res.json();

      if (res.ok) {
        setFoodItems((prev) =>
          prev.map((item) => (item._id === data._id ? data : item))
        );
        alert("✅ Item updated");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error("❌ Edit error:", err);
      alert("Server error while updating");
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold">🍔 Manage Items</h2>

        <button
          className="btn btn-success"
          onClick={() => setShowForm((p) => !p)}
        >
          {showForm ? "✖ Close Form" : "➕ Add New Item"}
        </button>
      </div>

      {showForm && (
        <div className="card bg-dark p-3 mb-4 shadow">
          <AddFoodForm
            onAdded={() => {
              fetchItems();
              setShowForm(false);
            }}
          />
        </div>
      )}

      {loading && <p className="text-muted">Loading items...</p>}

      {!loading &&
        foodCat.map((cat) => {
          console.log("====== CATEGORY ======");
console.log("Category from DB:", cat.CategoryName);
          const filteredItems = foodItems.filter(
  item =>
    (item.CategoryName || item.categoryName || "").toLowerCase().trim() ===
    cat.CategoryName.toLowerCase().trim()
);


          if (!filteredItems.length) return null;

          return (
            <div key={cat._id} className="mb-5">
              <h4 className="text-success ms-2">{cat.CategoryName}</h4>
              <hr className="border-success" />

              <div className="row g-4">
                {filteredItems.map((item) => (
                  <div key={item._id} className="col-12 col-md-6 col-lg-3">
                    <AdminCard
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </AdminLayout>
  );
}
