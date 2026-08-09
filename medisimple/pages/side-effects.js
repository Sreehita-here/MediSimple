import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import MedicineSearchInput from "../components/MedicineSearchInput";
import Disclaimer from "../components/Disclaimer";

const SIDE_EFFECT_OPTIONS = [
  "Nausea", "Headache", "Dizziness", "Stomach pain", "Diarrhea",
  "Constipation", "Fatigue", "Rash", "Vomiting", "Dry mouth",
  "Muscle pain", "Joint pain", "Heart palpitations", "Swelling", "Difficulty breathing"
];

export default function SideEffectsPage() {
  const router = useRouter();
  const [medicineName, setMedicineName] = useState("");
  const [reportedEffects, setReportedEffects] = useState([]);
  const [daysSinceStart, setDaysSinceStart] = useState("1-3");
  const [severity, setSeverity] = useState("mild");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill from query if available
  useEffect(() => {
    if (router.query.name) {
      setMedicineName(router.query.name);
    }
  }, [router.query.name]);

  const toggleEffect = (effect) => {
    setReportedEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  };

  const handleAnalyze = async () => {
    if (!medicineName) {
      alert("Please select a medicine.");
      return;
    }
    if (reportedEffects.length === 0) {
      alert("Please select at least one side effect you're experiencing.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("/api/side-effects/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName,
          reportedEffects,
          daysSinceStart,
          severity
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze side effects.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentConfig = (assessment) => {
    switch (assessment) {
      case "serious": return { icon: "🔴", label: "SERIOUS", bg: "var(--danger-light)", color: "var(--danger)", border: "var(--danger-border)" };
      case "unclear": return { icon: "🟡", label: "UNCLEAR", bg: "var(--warning-light)", color: "var(--warning-text)", border: "var(--warning-border)" };
      case "normal": return { icon: "✅", label: "NORMAL EXPECTED", bg: "var(--success-light)", color: "var(--success-text)", border: "var(--success-border)" };
      default: return { icon: "⚪", label: "UNKNOWN", bg: "var(--gray-100)", color: "var(--gray-600)", border: "var(--gray-300)" };
    }
  };

  return (
    <Layout title="Track Side Effects">
      <Head>
        <title>Track Side Effects — MediSimple</title>
        <meta name="description" content="Check if your side effects are normal or if you need to call a doctor." />
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
            📉 Track Side Effects
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Experiencing symptoms? Check if they are expected for your medicine.
          </p>
        </div>

        <div className="card fade-in-up" style={{ marginBottom: 20 }}>
          <div className="input-group">
            <label className="input-label">Medicine you are taking</label>
            <MedicineSearchInput
              initialValue={medicineName}
              onSelect={(m) => setMedicineName(m.name)}
              placeholder="Search medicine..."
            />
          </div>

          <div className="input-group" style={{ marginTop: 20 }}>
            <label className="input-label">Select Side Effects You&apos;re Having</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {SIDE_EFFECT_OPTIONS.map((effect) => (
                <button
                  key={effect}
                  onClick={() => toggleEffect(effect)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "var(--radius-full)",
                    border: reportedEffects.includes(effect) ? "1.5px solid var(--primary)" : "1.5px solid var(--gray-200)",
                    background: reportedEffects.includes(effect) ? "var(--primary-light)" : "var(--white)",
                    color: reportedEffects.includes(effect) ? "var(--primary-dark)" : "var(--text-secondary)",
                    fontSize: 14,
                    fontWeight: reportedEffects.includes(effect) ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ gap: 16, marginTop: 24 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Severity</label>
              <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="mild">Mild (annoying but tolerable)</option>
                <option value="moderate">Moderate (interferes with daily activities)</option>
                <option value="severe">Severe (unable to do normal activities)</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Days since starting medicine</label>
              <select className="input" value={daysSinceStart} onChange={(e) => setDaysSinceStart(e.target.value)}>
                <option value="Just started (today)">Just started (today)</option>
                <option value="1-3 days">1-3 days</option>
                <option value="4-7 days">4-7 days</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="More than 2 weeks">More than 2 weeks</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 24 }}
            onClick={handleAnalyze}
            disabled={loading || !medicineName || reportedEffects.length === 0}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</>
            ) : "🔍 Analyze Side Effects"}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger fade-in">
            <span>❌</span> <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="fade-in-up">
            {/* Assessment Header */}
            {(() => {
              const conf = getAssessmentConfig(result.assessment);
              return (
                <div
                  style={{
                    background: conf.bg,
                    border: `2px solid ${conf.border}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{conf.icon}</div>
                  <h2
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 800,
                      fontSize: 20,
                      color: conf.color,
                      marginBottom: 8,
                    }}
                  >
                    ASSESSMENT: {conf.label}
                  </h2>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>
                    You&apos;re experiencing <strong>{reportedEffects.length}</strong> symptoms.
                    Severity: <strong>{severity}</strong> • Duration: <strong>{daysSinceStart}</strong>
                  </p>
                </div>
              );
            })()}

            {/* Analysis Grid (Ground Truth) */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                💡 Symptom Analysis
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.classified.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: "1px solid var(--gray-200)",
                      background: !c.documented ? "var(--warning-light)" : c.tier === "serious" ? "var(--danger-light)" : "var(--success-light)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                      <span>{c.reported}</span>
                      {c.tier === "serious" ? (
                        <span style={{ fontSize: 12, color: "var(--danger)" }}>🔴 Serious</span>
                      ) : !c.documented ? (
                        <span style={{ fontSize: 12, color: "var(--warning-text)" }}>🟡 Unknown</span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--success-text)" }}>🟢 Expected</span>
                      )}
                    </div>
                    
                    {/* CRITICAL: Ground truth messaging based strictly on classification */}
                    {!c.documented ? (
                      <p style={{ fontSize: 13, color: "var(--warning-text)", margin: 0, fontWeight: 500 }}>
                        ⚠️ Not a documented side effect for {medicineName}. Mention this to your doctor.
                      </p>
                    ) : c.tier === "serious" ? (
                      <p style={{ fontSize: 13, color: "var(--danger)", margin: 0, fontWeight: 500 }}>
                        🚨 This is a serious side effect. Contact a doctor immediately.
                      </p>
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                        This is a documented {c.tier === "common" ? "common" : "less common"} side effect.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Self-care Advice (Groq Fallback if available) */}
            {result.careAdvice?.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--primary-dark)",
                    marginBottom: 12,
                  }}
                >
                  ✅ What You Should Do
                </h3>
                <ul className="check-list">
                  {result.careAdvice.map((advice, i) => (
                    <li key={i}>{advice}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* When to Call Doctor */}
            {(result.callDoctorIf?.length > 0 || result.additionalCallDoctorIf?.length > 0) && (
              <div
                className="card"
                style={{
                  marginBottom: 20,
                  border: "1px solid var(--danger-border)",
                  background: "#FFF5F5"
                }}
              >
                <h3
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--danger)",
                    marginBottom: 12,
                  }}
                >
                  🔴 Call Doctor If:
                </h3>
                <ul className="dont-list">
                  {result.callDoctorIf?.map((item, i) => (
                    <li key={`db-${i}`}>{item}</li>
                  ))}
                  {result.additionalCallDoctorIf?.map((item, i) => (
                    <li key={`groq-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid-2" style={{ marginBottom: 24 }}>
               <a href="tel:112" className="btn btn-danger">🆘 Call Doctor</a>
               <button className="btn btn-secondary" onClick={() => router.push("/doctor-report")}>📤 Add to Doctor Report</button>
            </div>

            <Disclaimer />
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </Layout>
  );
}
