import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";

export default function SettingsPage() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        // Safe ignore
      } finally {
        setUserLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.reload();
      }
    } catch {
      alert("Failed to sign out. Please try again.");
    }
  };

  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("medisimple_reminders_enabled");
      setRemindersEnabled(saved !== "false");
    }
  }, []);

  const handleToggleReminders = async (val) => {
    setRemindersEnabled(val);
    localStorage.setItem("medisimple_reminders_enabled", String(val));
    if (val && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  };

  const handleClearData = async () => {
    if (!confirm("⚠️ Are you sure? This will delete all your saved medicines permanently.")) {
      return;
    }
    
    setClearing(true);
    try {
      // 1. Fetch all user medicines
      const res = await fetch("/api/user-medicines");
      if (!res.ok) throw new Error("Failed to fetch medicines");
      const data = await res.json();
      
      const allMeds = [...(data.active || []), ...(data.stopped || [])];
      
      // 2. Delete each one individually via the backend API (as per specification)
      await Promise.all(
        allMeds.map(m => 
          fetch(`/api/user-medicines/${m._id}`, { method: "DELETE" })
        )
      );
      
      alert("✅ All medicine data has been cleared successfully.");
    } catch (err) {
      alert("❌ Failed to clear data. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <Layout title="Settings" showBack={false}>
      <Head>
        <title>Settings — MediSimple</title>
        <meta name="description" content="Manage your MediSimple app settings and data." />
      </Head>

      <div className="page-content">
        <div className="fade-in" style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--text-primary)",
              marginBottom: 6,
            }}
          >
            ⚙️ Settings
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Manage your preferences and privacy.
          </p>
        </div>

        {/* Auth / Profile Section */}
        {!userLoading && (
          <div className="card fade-in-up" style={{ marginBottom: 16 }}>
            {user ? (
              <div>
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                  👤 Patient Profile
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Name</span>
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Email</span>
                    <span style={{ fontWeight: 600 }}>{user.email}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-full" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                  🔑 Secure Patient Account
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Sign in or create an account to securely save your medication list and manage notifications across devices.
                </p>
                <Link href="/login" className="btn btn-primary btn-full">
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        )}



        {/* Notifications */}
        <div className="card fade-in-up-delay-1" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
            🔔 Notifications
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <div>
              <span style={{ fontWeight: 500, display: "block" }}>Medication Reminders</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Receive alerts when it's time to take your pills</span>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => handleToggleReminders(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--primary)" }}
              />
            </label>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="card fade-in-up-delay-2" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
            🔒 Data & Privacy
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--gray-100)" }}>
            <div>
              <div style={{ fontWeight: 500 }}>Save search history</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Keep recent searches for quick access</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "var(--primary)" }} />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <div>
              <div style={{ fontWeight: 500 }}>Anonymous Analytics</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Help us improve the app</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "var(--primary)" }} />
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="card fade-in-up-delay-3" style={{ marginBottom: 16, border: "1px solid var(--danger-border)" }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16, color: "var(--danger)" }}>
            ⚠️ Data Management
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
            This will permanently delete all your tracked medicines from our database. This action cannot be undone.
          </p>
          <button 
            className="btn btn-danger btn-full" 
            onClick={handleClearData}
            disabled={clearing}
          >
            {clearing ? "Clearing Data..." : "🗑️ Clear All Data"}
          </button>
        </div>


        
        <div style={{ height: 24 }} />
      </div>
    </Layout>
  );
}
