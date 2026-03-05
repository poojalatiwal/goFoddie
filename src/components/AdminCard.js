import React, { useState } from "react";

const normalizeOptions = (options) => {
  if (Array.isArray(options)) return options[0] || {};
  if (typeof options === "object" && options !== null) return options;
  return {};
};

export default function AdminCard({ item, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);

  const [editedItem, setEditedItem] = useState(() => ({
    ...item,
    options: normalizeOptions(item.options)
  }));


  const handleField = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };


  const handleOptionChange = (key, value) => {
    setEditedItem(prev => ({
      ...prev,
      options: { ...prev.options, [key]: value }
    }));
  };

  const removeOption = (key) => {
    const copy = { ...editedItem.options };
    delete copy[key];
    setEditedItem(prev => ({ ...prev, options: copy }));
  };


  const save = () => {
    if (!editedItem.CategoryName && editedItem.category) {
      editedItem.CategoryName = editedItem.category;
    }

    onEdit({
      ...editedItem,
      options: editedItem.options 
    });

    setIsEditing(false);
  };


  return (
    <div className="card mt-3 shadow-sm" style={{ borderRadius: 12 }}>
      <img
        src={item.img || "https://via.placeholder.com/300x180?text=No+Image"}
        alt={item.name}
        className="card-img-top"
        style={{ height: 150, objectFit: "cover" }}
      />

      <div className="card-body">

        {isEditing ? (
          <>
            <input className="form-control mb-2" name="name"
              value={editedItem.name || ""} onChange={handleField} />

            <input className="form-control mb-2" name="CategoryName"
              value={editedItem.CategoryName || ""} onChange={handleField} />

            <textarea className="form-control mb-2" rows="2"
              name="description" value={editedItem.description || ""}
              onChange={handleField} />

            <input className="form-control mb-2" name="img"
              value={editedItem.img || ""} onChange={handleField} />

            <strong>Prices</strong>

            {Object.keys(editedItem.options).map((k) => (
              <div key={k} className="d-flex gap-2 mb-2">
                <input className="form-control form-control-sm" value={k} readOnly />
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={editedItem.options[k]}
                  onChange={(e) => handleOptionChange(k, Number(e.target.value))}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeOption(k)}
                >✖</button>
              </div>
            ))}

            {/* add new price */}
            <div className="d-flex gap-2 mb-2">
              <input id={`new-key-${item._id}`} className="form-control form-control-sm" placeholder="size" />
              <input id={`new-val-${item._id}`} type="number" className="form-control form-control-sm" placeholder="price" />
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => {
                  const k = document.getElementById(`new-key-${item._id}`).value.trim();
                  const v = document.getElementById(`new-val-${item._id}`).value;
                  if (k && v) handleOptionChange(k, Number(v));
                }}
              >
                Add
              </button>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-success w-100 btn-sm" onClick={save}>Save</button>
              <button className="btn btn-secondary w-100 btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h6 className="fw-bold">{item.name}</h6>
            <small className="text-muted">{item.CategoryName || item.category}</small>

            <div className="my-2">
              {Object.entries(normalizeOptions(item.options)).map(([k, v]) => (
                <div key={k} className="fw-semibold">{k}: ₹{v}</div>
              ))}
            </div>

            <div className="d-grid gap-2">
              <button className="btn btn-warning btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(item._id)}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
