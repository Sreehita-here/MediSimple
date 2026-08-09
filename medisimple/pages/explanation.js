import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import Disclaimer from "../components/Disclaimer";

function SectionCard({ number, title, children }) {
  return (
    <div className="card fade-in-up" style={{ marginBottom: 16 }}>
      <div className="section-header">
        <div className="section-number">{number}</div>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SideEffectTier({ label, items, color, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 700,
          color: color,
        }}
      >
        <span>{icon}</span> {label}
      </div>
      <ul className="check-list" style={{ marginLeft: 8 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 14 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExplanationPage() {
  const router = useRouter();
  const { name, strength } = router.query;

  const [medicine, setMedicine] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [addingToList, setAddingToList] = useState(false);
  const [addedToList, setAddedToList] = useState(false);

  useEffect(() => {
    if (!name) return;
    fetchMedicine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const fetchMedicine = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try verified DB first
      const res = await fetch(`/api/medicines/${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setMedicine(data.medicine);
        setSource("database");
      } else if (res.status === 404) {
        // Fallback to Groq
        const groqRes = await fetch("/api/groq/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicineName: name, strength }),
        });
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          setMedicine(groqData.data);
          setSource("groq");
        } else {
          const errData = await groqRes.json();
          setError(errData.error || "Unable to load medicine information.");
        }
      } else {
        setError("Unable to load medicine information.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async () => {
    setAddingToList(true);
    try {
      await fetch("/api/user-medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: medicine.name,
          strength: medicine.strength,
          frequency: "As prescribed",
        }),
      });
      setAddedToList(true);
    } catch {
      alert("Failed to add to your list. Please try again.");
    } finally {
      setAddingToList(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Medicine Details">
        <div className="loading-container">
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <p>Loading medicine information...</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Checking our verified database...
          </p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Medicine Details">
        <div className="page-content">
          <div className="alert alert-danger">
            <span>❌</span>
            <div>
              <strong>Unable to load information</strong>
              <p style={{ margin: "4px 0 0" }}>{error}</p>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={fetchMedicine} style={{ marginTop: 16 }}>
            🔄 Try Again
          </button>
          <Link href="/medicine-input" className="btn btn-ghost btn-full" style={{ marginTop: 8 }}>
            ← Search Different Medicine
          </Link>
        </div>
      </Layout>
    );
  }

  if (!medicine) return null;

  return (
    <Layout title="Medicine Details">
      <Head>
        <title>{medicine.name} — MediSimple</title>
        <meta
          name="description"
          content={`Learn about ${medicine.name}: what it does, how to take it, side effects and more.`}
        />
      </Head>

      <div className="page-content">
        {/* Medicine Header */}
        <div
          className="card fade-in"
          style={{
            background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
            border: "1px solid var(--primary-border)",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800,
                  fontSize: 26,
                  color: "var(--primary-darker)",
                  marginBottom: 4,
                }}
              >
                📋 {medicine.name}
                {medicine.strength && (
                  <span style={{ fontSize: 18, fontWeight: 500, color: "var(--primary)", marginLeft: 8 }}>
                    {medicine.strength}
                  </span>
                )}
              </h1>
              {(medicine.condition || medicine.whatItDoes) && (
                <p style={{ fontSize: 14, color: "var(--primary)", fontWeight: 600 }}>
                  💊 FOR: {medicine.condition || "See details below"}
                </p>
              )}
              {medicine.commonBrands?.length > 0 && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  Also known as: {medicine.commonBrands.join(", ")}
                </p>
              )}
            </div>

            {/* Source Badge */}
            {source === "database" && (
              <span className="badge badge-success" style={{ whiteSpace: "nowrap" }}>
                ✅ Verified (FDA/WHO)
              </span>
            )}
          </div>
        </div>

        {/* Section 1 — What It Does */}
        <SectionCard number="1" title="What It Does">
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{medicine.whatItDoes}</p>
        </SectionCard>

        {/* Section 2 — How to Take It */}
        <SectionCard number="2" title="How to Take It">
          {medicine.howToTake?.length > 0 && (
            <ul className="check-list" style={{ marginBottom: medicine.dontDo ? 16 : 0 }}>
              {medicine.howToTake.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          )}
          {medicine.dontDo?.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--danger)",
                  marginBottom: 8,
                }}
              >
                ❌ DON&apos;T:
              </div>
              <ul className="dont-list">
                {medicine.dontDo.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>

        {/* Section 3 — Side Effects */}
        <SectionCard number="3" title="Side Effects — What You Might Feel">
          <SideEffectTier
            label="COMMON (usually go away)"
            items={medicine.sideEffects?.common}
            color="var(--success)"
            icon="🟢"
          />
          <SideEffectTier
            label="LESS COMMON"
            items={medicine.sideEffects?.lessCommon}
            color="var(--warning-text)"
            icon="🟡"
          />
          <SideEffectTier
            label="RARE but SERIOUS"
            items={medicine.sideEffects?.serious}
            color="var(--danger)"
            icon="🔴"
          />
          {medicine.sideEffects?.serious?.length > 0 && (
            <div className="alert alert-danger" style={{ marginTop: 12, marginBottom: 0 }}>
              → <strong>CALL DOCTOR or GO TO HOSPITAL</strong> if you experience any serious side effects
            </div>
          )}
        </SectionCard>

        {/* Section 4 — Tell Your Doctor */}
        {(medicine.tellDoctor?.length > 0 || medicine.name) && (
          <SectionCard number="4" title="What to Tell Your Doctor">
            <ul className="check-list">
              <li>
                &ldquo;I&apos;m taking {medicine.name} {medicine.strength}&rdquo;
              </li>
              <li>
                Ask: &ldquo;Is this dose right for me?&rdquo;
              </li>
              <li>
                Ask: &ldquo;How long will I be on this?&rdquo;
              </li>
              {medicine.tellDoctor?.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </SectionCard>
        )}



        {/* Section 5 — When to Call Doctor */}
        <SectionCard number="5" title="When to Call Doctor">
          {medicine.callDoctorIf?.length > 0 ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 8 }}
                >
                  🔴 IMMEDIATELY — Call Doctor or Go to Hospital:
                </div>
                <ul className="dont-list">
                  {medicine.callDoctorIf.slice(0, 3).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              {medicine.callDoctorIf.length > 3 && (
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "var(--warning-text)", marginBottom: 8 }}
                  >
                    🟡 SOON (within 1-2 days):
                  </div>
                  <ul className="check-list">
                    {medicine.callDoctorIf.slice(3).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Contact your doctor if you experience any unusual symptoms.
            </p>
          )}
        </SectionCard>

        {/* Section 6 — Storage */}
        <SectionCard number="6" title="Storage & Reminders">
          <ul className="check-list">
            {medicine.storage && <li>📍 Store: {medicine.storage}</li>}
            <li>🚫 Never stop suddenly without doctor&apos;s OK</li>
            <li>⏰ Set a daily reminder to take your medicine on time</li>
            <li>🗑️ Dispose of expired medicines safely — don&apos;t flush down the drain</li>
          </ul>
        </SectionCard>

        {/* Action Buttons */}
        <div className="grid-2" style={{ marginTop: 8, marginBottom: 16 }}>
          <Link
            href={{
              pathname: "/dosage-validation",
              query: { name: medicine.name, strength: medicine.strength },
            }}
            className="btn btn-secondary"
            id="validate-dosage-btn"
          >
            📋 Validate Dosage
          </Link>
          <button
            className="btn btn-ghost"
            onClick={handleAddToList}
            disabled={addingToList || addedToList}
            id="add-to-list-btn"
          >
            {addedToList ? "✅ Added to My Meds!" : addingToList ? "Adding..." : "➕ Add to My Meds"}
          </button>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <Link
            href={{
              pathname: "/medicine-card",
              query: { name: medicine.name, strength: medicine.strength },
            }}
            className="btn btn-ghost"
            id="print-card-btn"
          >
            🖨️ Print Card
          </Link>
          <Link
            href="/doctor-report"
            className="btn btn-ghost"
            id="share-report-btn"
          >
            📤 Share Report
          </Link>
        </div>

        {/* Disclaimer */}
        <Disclaimer />

        <div style={{ height: 24 }} />
      </div>
    </Layout>
  );
}
