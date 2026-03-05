import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import AccountSidebar from "./Account/AccountSidebar";
import Overview from "./Account/Overview";
import ProfileDetails from "./Account/ProfileDetails";
import AddressManager from "./Account/AddressManager";
import HelpSection from "./Account/HelpSection";
import Orders from "./Account/AccountOrders";
import DeleteAccount from "./Account/DeleteAccount";

import "./Account/AccountSidebar.css";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const load = async () => {
      try {
        const userRes = await fetch("http://localhost:5001/api/auth/getuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        const userData = await userRes.json();
        setUser(userData);

        const addrRes = await fetch("http://localhost:5001/api/auth/addresses", {
          headers: { "auth-token": token },
        });

        const addrData = await addrRes.json();
        setAddresses(Array.isArray(addrData) ? addrData : []);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
      <Navbar />

      <div className="account-page">
        <div className="account-wrapper">
          <div className="account-layout">


            <aside className="account-left">
              <AccountSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </aside>

            <main className="account-right">

              {activeTab === "Overview" && user && (
                <Overview user={user} onEditProfile={setUser} />
              )}

              {activeTab === "Orders" && <Orders />}

              {activeTab === "Profile" && user && (
                <ProfileDetails user={user} onUpdate={setUser} />
              )}

              {activeTab === "Addresses" && (
                <AddressManager
                  addresses={addresses}
                  onAdd={(a) => setAddresses((p) => [...p, a])}
                  onEdit={(i, updated) =>
                    setAddresses((p) =>
                      p.map((x, idx) => (idx === i ? updated : x))
                    )
                  }
                />
              )}

              {activeTab === "Help" && <HelpSection />}

              {activeTab === "Delete Account" && <DeleteAccount />}

            </main>
          </div>
        </div>
      </div>
    </>
  );
}
