import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import AddFoodForm from "../components/AddFoodForm";

export default function Home() {
  const [foodCat, setFoodCat] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [search, setSearch] = useState("");

  const role = localStorage.getItem("role") || "user";
  const token = localStorage.getItem("token");


  const loadFoodItems = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/foodData", {
        method: "POST",
      });

      const data = await res.json();
      setFoodItems(data[0] || []);
      setFoodCat(data[1] || []);
    } catch (err) {
      console.error("Failed to load foods:", err);
    }
  };

  useEffect(() => {
    loadFoodItems();
  }, []);

  const handleDeleteFood = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/admin/food/${id}`, {
        method: "DELETE",
        headers: { "auth-token": token },
      });

      if (res.ok) loadFoodItems();
      else alert("Delete failed");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar search={search} setSearch={setSearch} />

      <div className="page-wrapper">
        <div className="container">
          {foodCat.length > 0 ? (
            foodCat.map((cat) => {
              const filteredItems = foodItems.filter((item) => {
                const nameMatch = item.name
                  .toLowerCase()
                  .includes(search.toLowerCase());
                const categoryMatch = item.categoryName
                  .toLowerCase()
                  .includes(search.toLowerCase());

                return (
                  item.categoryName?.toLowerCase() ===
                    cat.CategoryName?.toLowerCase() &&
                  (nameMatch || categoryMatch)
                );
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={cat.CategoryName} className="row mb-4">
                  <h3 className="mt-3">{cat.CategoryName}</h3>
                  <hr />

                  {filteredItems.map((item) => (
                    <div
                      key={item._id}
                      className="col-12 col-md-6 col-lg-3 mb-4"
                    >
                      <Card
                        foodName={item.name}
                        item={item}
                        ImgSrc={item.img}
                        options={item.options || {}}
                        role={role}
                        onDelete={() => handleDeleteFood(item._id)}
                      />
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="text-center mt-4">No food items available</div>
          )}

          {role === "admin" && (
            <div className="container my-4">
              <h4>Add new item</h4>
              <AddFoodForm onAdded={loadFoodItems} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
