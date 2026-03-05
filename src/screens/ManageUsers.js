import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/users", {
        headers: {
          "auth-token": token
        }
      });

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id, name) => {
    const confirm = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "auth-token": token
        }
      });

      const data = await res.json();

      if (res.ok) {
        alert("User deleted successfully");
        fetchUsers();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Server error");
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-white mb-4">👥 Manage Users</h2>

      <div className="card bg-dark shadow-sm">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-center">Remove Account</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u._id}>
                    <td>{i + 1}</td>
                    <td className="fw-semibold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "admin" ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteUser(u._id, u.name)}
                      >
                        🗑 Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
