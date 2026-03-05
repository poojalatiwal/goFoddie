import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [newAddress, setNewAddress] = useState({
    name: "",
    mobile: "",
    pincode: "",
    state: "",
    house: "",
    address: "",
    town: "",
  });

  const fetchProfile = async () => {
    try {
      let res = await fetch("http://localhost:5001/api/auth/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("Token"),
        },
      });
      const data = await res.json();
      if (data) {
        setUser(data);
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveAddress = async () => {
    const token = localStorage.getItem("authToken");
    const method = editIndex !== null ? "PUT" : "POST";
    const url =
      editIndex !== null
        ? `http://localhost:5001/api/auth/updateAddress/${editIndex}`
        : "http://localhost:5001/api/auth/addAddress";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(newAddress),
      });
      const result = await res.json();

      if (result.success) {
        alert(editIndex !== null ? "Address updated!" : "Address added!");

        if (editIndex !== null) {
          const updated = [...addresses];
          updated[editIndex] = result.address;
          setAddresses(updated);
        } else {
          setAddresses([...addresses, result.address]);
        }


        setShowModal(false);
        setEditIndex(null);
        setNewAddress({
          name: "",
          mobile: "",
          pincode: "",
          state: "",
          house: "",
          address: "",
          town: "",
        });
      } else {
        alert("Operation failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Server error!");
    }
  };


  const handleRemoveAddress = async (index) => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        `http://localhost:5001/api/auth/removeAddress/${index}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );
      const result = await res.json();
      if (result.success) {
        alert("Address removed!");
        setAddresses(addresses.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAddress = (index) => {
    setNewAddress(addresses[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  if (!user) return <div className="container mt-5">Loading profile...</div>;

  return (
    <div className="container mt-5 d-flex flex-wrap">
      <div className="col-12 col-md-3 border-end pe-3 mb-4">
        <h5 className="mb-3">Account</h5>
        <ul className="list-unstyled">
          {[
            { key: "overview", label: "Overview" },
            { key: "orders", label: "Orders & Returns" },
            { key: "addresses", label: "Addresses" },
          ].map((item) => (
            <li
              key={item.key}
              className={`mb-2 ${
                activeSection === item.key ? "fw-bold text-success" : "text-secondary"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setActiveSection(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>

        <h6 className="mt-4 mb-2 text-uppercase">Legal</h6>
        <ul className="list-unstyled">
          <li className="mb-2 text-secondary">Terms of Use</li>
          <li className="mb-2 text-secondary">Privacy Policy</li>
        </ul>
      </div>


      <div className="col-12 col-md-9 ps-4">
        {activeSection === "overview" && (
          <div>
            <h4>Welcome, {user.name} 👋</h4>
            <div className="card shadow-sm p-3 mt-3 d-flex align-items-center flex-wrap">
              <img
                src={user.profilePic || "https://via.placeholder.com/100"}
                alt="Profile"
                className="rounded-circle me-3"
                width="100"
                height="100"
              />
              <div>
                <h5>{user.name}</h5>
                <p className="text-muted mb-1">{user.email}</p>
                <p className="text-muted mb-1">Phone: {user.phone || "Not added"}</p>
                <p className="text-muted mb-1">Gender: {user.gender || "Not added"}</p>
                <Button variant="outline-success" size="sm">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "orders" && (
          <div>
            <h4>Your Orders</h4>
            <p className="text-muted mt-3">
              You haven’t placed any orders yet. Once you order, they’ll appear here.
            </p>
          </div>
        )}

        {activeSection === "addresses" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Saved Addresses</h4>
              <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                + Add New Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <p>No saved addresses found.</p>
            ) : (
              addresses.map((addr, index) => (
                <div key={index} className="card shadow-sm p-3 mb-3">
                  <h5>{addr.name}</h5>
                  <p className="mb-1">{addr.house}</p>
                  <p className="mb-1">{addr.address}</p>
                  <p className="mb-1">
                    {addr.town}, {addr.state} - {addr.pincode}
                  </p>
                  <p>Mobile: {addr.mobile}</p>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditAddress(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveAddress(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? "Edit Address" : "Add New Address"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.name}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mobile *</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.mobile}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, mobile: e.target.value })
                }
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Form.Group className="flex-fill">
                <Form.Label>Pincode *</Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pincode: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="flex-fill">
                <Form.Label>State *</Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                />
              </Form.Group>
            </div>
            <Form.Group className="mb-2">
              <Form.Label>House / Block *</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.house}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, house: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Street / Area *</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Locality / Town *</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.town}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, town: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAddress}>
            {editIndex !== null ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
