import React, { useState } from "react";

export default function AddFoodForm({ onAdded = () => {} }) {
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState("");

  const [options, setOptions] = useState({
    small: "",
    medium: "",
    large: "",
    half: "",
    full: ""
  });

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name.trim() || !categoryName.trim() || !img.trim()) {
        alert("Name, Category, and Image are required");
        return;
      }

      const cleanOptions = {};
      Object.entries(options).forEach(([key, value]) => {
        if (value !== "" && !isNaN(value)) {
          cleanOptions[key] = Number(value);
        }
      });

      if (Object.keys(cleanOptions).length === 0) {
        alert("Please add at least one price option.");
        return;
      }

      const payload = {
        name: name.trim(),
        categoryName: categoryName.trim(),
        img: img.trim(),
        description: description.trim(),
        options: cleanOptions 
      };

      const res = await fetch("http://localhost:5001/api/admin/food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add food");
        return;
      }

      alert("✅ Food item added successfully");

      setName("");
      setCategoryName("");
      setDescription("");
      setImg("");
      setOptions({ small: "", medium: "", large: "", half: "", full: "" });

      onAdded();

    } catch (err) {
      console.error("❌ Error adding food:", err);
      alert("Server error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border rounded bg-dark text-light mb-3"
    >
      <input
        className="form-control my-2"
        placeholder="Food name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="form-control my-2"
        placeholder="Category (Pasta, Burgers...)"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        required
      />

      <input
        className="form-control my-2"
        placeholder="Image URL"
        value={img}
        onChange={(e) => setImg(e.target.value)}
        required
      />

      <textarea
        className="form-control my-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <strong>Price Options</strong>

      <div className="row g-2 my-2">
        {["small", "medium", "large", "half", "full"].map((size) => (
          <div key={size} className="col-md-2 col-4">
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder={size}
              value={options[size]}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, [size]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      <button className="btn btn-success w-100 mt-2" type="submit">
        ➕ Add Food Item
      </button>
    </form>
  );
}
