import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";

export default function MyMedicinesPage() {
  const router = useRouter();
  const [active, setActive] = useState([]);
  const [stopped, setStopped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addForm, setAddForm] = useState({ show: false, name: "", strength: "", frequency: "", reminderTimes: [""] });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user-medicines");
      const data = await res.json();
      setActive(data.active || []);
      setStopped(data.stopped || []);
    } catch {
      setError("Failed to load your medicines. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Mark this medicine as stopped?")) return;
    try {
      await fetch(`/api/user-medicines/${id}`, { method: "PATCH" });
      fetchMedicines();
    } catch {
      alert("Failed to update. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this medicine from your history?")) return;
    try {
      await fetch(`/api/user-medicines/${id}`, { method: "DELETE" });
      fetchMedicines();
    } catch {
      alert("Failed to delete. Please try again.");
    }
  };

  const handleAddReminder = async (id) => {
    const time = window.prompt("Enter reminder time (e.g., 08:00 or 20:30):");
    if (!time) return;
    
    // basic validation
    if (!/^([01]\d|2[0-3]):?([0-5]\d)$/.test(time)) {
      alert("Please enter a valid time in HH:MM format.");
      return;
    }

    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      
      await fetch(`/api/user-medicines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addReminder", time: time.replace(":", "").length === 4 && !time.includes(":") ? time.slice(0, 2) + ":" + time.slice(2) : time })
      });
      fetchMedicines();
    } catch {
      alert("Failed to add reminder.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.strength) return;
    setAddLoading(true);
    try {
      const filteredReminders = addForm.reminderTimes.filter(t => t.trim() !== "");
      // Request browser notification permissions if reminders are being set
      if (filteredReminders.length > 0 && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
      }
      await fetch("/api/user-medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          strength: addForm.strength,
          frequency: addForm.frequency,
          reminderTimes: filteredReminders,
        }),
      });
      setAddForm({ show: false, name: "", strength: "", frequency: "", reminderTimes: [""] });
      fetchMedicines();
    } catch {
      alert("Failed to add medicine. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Layout title="My Medicines">
      <Head>
        <title>My Medicines — MediSimple</title>
        <meta name="description" content="Track all your current and past medicines in one place." />
      </Head>

      <div className="page-content">
        {/* Header */}
        <div className="fade-in" style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: 24,
              marginBottom: 6,
            }}
          >
            💊 My Medicines
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            All your medicines tracked in one place, privately.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading your medicines...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <span>❌</span>
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Currently Taking */}
            <div className="card fade-in-up" style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  📋 Currently Taking ({active.length})
                </h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setAddForm({ ...addForm, show: !addForm.show, reminderTimes: [""] })}
                  id="add-medicine-btn"
                >
                  ➕ Add
                </button>
              </div>

              {/* Add Form */}
              {addForm.show && (
                <form
                  onSubmit={handleAdd}
                  className="card card-sm fade-in"
                  style={{
                    background: "var(--primary-light)",
                    border: "1px solid var(--primary-border)",
                    marginBottom: 16,
                  }}
                >
                  <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Medicine Name</label>
                      <input
                        type="text"
                        className="input"
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        placeholder="e.g., Metformin"
                        required
                        id="add-med-name"
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Strength</label>
                      <input
                        type="text"
                        className="input"
                        value={addForm.strength}
                        onChange={(e) => setAddForm({ ...addForm, strength: e.target.value })}
                        placeholder="e.g., 500mg"
                        required
                        id="add-med-strength"
                      />
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: 10 }}>
                    <label className="input-label">Frequency</label>
                    <input
                      type="text"
                      className="input"
                      value={addForm.frequency}
                      onChange={(e) => setAddForm({ ...addForm, frequency: e.target.value })}
                      placeholder="e.g., Twice daily with food"
                      id="add-med-frequency"
                    />
                  </div>
                  
                  {/* Reminder Times */}
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label className="input-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>🔔 Set Reminder Alarms</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "2px 6px", fontSize: 11 }}
                        onClick={() => setAddForm(prev => ({ ...prev, reminderTimes: [...prev.reminderTimes, ""] }))}
                      >
                        + Add Time
                      </button>
                    </label>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {addForm.reminderTimes.map((time, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="time"
                            className="input"
                            style={{ flex: 1, padding: "6px 10px" }}
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...addForm.reminderTimes];
                              newTimes[idx] = e.target.value;
                              setAddForm(prev => ({ ...prev, reminderTimes: newTimes }));
                            }}
                          />
                          {addForm.reminderTimes.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ color: "var(--danger)", padding: "6px" }}
                              onClick={() => {
                                const newTimes = addForm.reminderTimes.filter((_, i) => i !== idx);
                                setAddForm(prev => ({ ...prev, reminderTimes: newTimes }));
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={addLoading}
                      id="submit-add-med"
                    >
                      {addLoading ? "Adding..." : "✓ Add Medicine"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setAddForm({ show: false, name: "", strength: "", frequency: "", reminderTimes: [""] })}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {active.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
                  <p>No medicines added yet.</p>
                  <Link href="/medicine-input" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                    Search Medicines →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {active.map((m, i) => (
                    <div
                      key={m._id}
                      style={{
                        border: "1px solid var(--gray-200)",
                        borderRadius: "var(--radius-md)",
                        padding: 16,
                        background: "var(--white)",
                        transition: "box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow = "var(--shadow-md)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: 700,
                              fontSize: 16,
                              color: "var(--primary)",
                            }}
                          >
                            {i + 1}. {m.name}
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 400,
                                color: "var(--text-secondary)",
                                marginLeft: 6,
                              }}
                            >
                              {m.strength}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                            📅 Since: {formatDate(m.startDate)}
                            {m.frequency && ` • ⏰ ${m.frequency}`}
                          </div>
                          {m.reminderTimes && m.reminderTimes.length > 0 && (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                              {m.reminderTimes.map((time) => (
                                <span
                                  key={time}
                                  style={{
                                    fontSize: 11,
                                    background: "var(--warning-light)",
                                    border: "1px solid var(--warning-border)",
                                    color: "var(--warning-text)",
                                    borderRadius: "4px",
                                    padding: "2px 6px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 2
                                  }}
                                >
                                  🔔 {time}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="badge badge-success">Active</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddReminder(m._id)}
                          id={`add-reminder-${m._id}`}
                        >
                          ⏰ Add Reminder
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => router.push({ pathname: "/medicine-card", query: { name: m.name, strength: m.strength } })}
                          id={`report-${m._id}`}
                        >
                          🖨️ Card
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => router.push({ pathname: "/side-effects", query: { name: m.name } })}
                          id={`track-effects-${m._id}`}
                          style={{ color: "var(--primary)" }}
                        >
                          📉 Track Side Effects
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRemove(m._id)}
                          id={`remove-${m._id}`}
                        >
                          ⏸ Remove
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(m._id)}
                          style={{ color: "var(--danger)", border: "1px solid var(--danger-border)" }}
                          id={`delete-${m._id}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stopped */}
            {stopped.length > 0 && (
              <div className="card fade-in-up-delay-1" style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 16,
                    color: "var(--text-secondary)",
                  }}
                >
                  ⏸️ Stopped Taking ({stopped.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stopped.map((m) => (
                    <div
                      key={m._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "var(--gray-50)",
                        border: "1px solid var(--gray-200)",
                        borderRadius: "var(--radius-md)",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-secondary)" }}>
                          {m.name} {m.strength}
                        </div>
                        {m.stopDate && (
                          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                            Stopped: {formatDate(m.stopDate)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(m._id)}
                          style={{ color: "var(--danger)" }}
                          id={`delete-stopped-${m._id}`}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Summary */}
            {active.length > 0 && (
              <div
                className="card fade-in-up-delay-2"
                style={{
                  background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                  border: "1px solid var(--primary-border)",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 12,
                    color: "var(--primary-darker)",
                  }}
                >
                  📊 Profile Summary
                </h3>
                <div className="grid-3" style={{ gap: 12 }}>
                  {[
                    { label: "Active Medicines", value: active.length, icon: "💊" },
                    { label: "Stopped Medicines", value: stopped.length, icon: "⏸️" },
                    { label: "Total Tracked", value: active.length + stopped.length, icon: "📋" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28 }}>{stat.icon}</div>
                      <div
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 800,
                          fontSize: 24,
                          color: "var(--primary)",
                        }}
                      >
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid-2" style={{ gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => router.push("/doctor-report")}
                id="export-doctor-btn"
              >
                📤 Export for Doctor
              </button>
              <Link
                href="/medicine-input"
                className="btn btn-primary"
                id="add-more-btn"
              >
                ➕ Add More
              </Link>
            </div>
          </>
        )}
        <div style={{ height: 24 }} />
      </div>
    </Layout>
  );
}
