import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Disclaimer from "../components/Disclaimer";

const STATUS_CONFIG = {
  safe: {
    icon: "✅",
    label: "DOSAGE CHECK: SAFE",
    color: "var(--success)",
    bg: "var(--success-light)",
    border: "var(--success-border)",
    alertClass: "alert-success",
  },
  warning: {
    icon: "⚠️",
    label: "DOSAGE CHECK: LOW / UNUSUAL DOSE",
    color: "var(--warning-text)",
    bg: "var(--warning-light)",
    border: "var(--warning-border)",
    alertClass: "alert-warning",
  },
  danger: {
    icon: "🔴",
    label: "WARNING: POSSIBLE OVERDOSE",
    color: "var(--danger)",
    bg: "var(--danger-light)",
    border: "var(--danger-border)",
    alertClass: "alert-danger",
  },
  unknown: {
    icon: "❓",
    label: "DOSAGE: UNKNOWN",
    color: "var(--text-secondary)",
    bg: "var(--gray-100)",
    border: "var(--gray-300)",
    alertClass: "alert-info",
  },
};

export default function DosageValidationPage() {
  const router = useRouter();
  const { name: queryName, strength: queryStrength } = router.query;

  const [medicineName, setMedicineName] = useState(queryName || "");
  const [dosePerTablet, setDosePerTablet] = useState(
    queryStrength ? parseInt(queryStrength) || "" : ""
  );
  const [frequency, setFrequency] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dailyDoseMg = Number(dosePerTablet) * Number(frequency);

  const handleCheck = async () => {
    if (!medicineName || !dosePerTablet || !frequency) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dosage/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineName, dailyDoseMg }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const status = result?.status ? STATUS_CONFIG[result.status] || STATUS_CONFIG.unknown : null;

  return (
    <Layout title="Dosage Check">
      <Head>
        <title>Dosage Validation — MediSimple</title>
        <meta name="description" content="Check if your medicine dosage is within the safe range." />
      </Head>

      <div className="page-content">
        {/* Header */}
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
            📋 Is Your Dosage Correct?
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Enter your dosage details to check if it&apos;s within the safe range.
          </p>
        </div>

        {/* Form */}
        <div className="card fade-in-up" style={{ marginBottom: 16 }}>
          <div className="input-group">
            <label className="input-label" htmlFor="dose-medicine-name">
              Medicine Name
            </label>
            <input
              id="dose-medicine-name"
              type="text"
              className="input"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g., Paracetamol"
            />
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="input-group">
              <label className="input-label" htmlFor="dose-per-tablet">
                Dose per tablet (mg)
              </label>
              <input
                id="dose-per-tablet"
                type="number"
                className="input"
                value={dosePerTablet}
                onChange={(e) => setDosePerTablet(e.target.value)}
                placeholder="e.g., 500"
                min="1"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="dose-frequency">
                Tablets per day
              </label>
              <select
                id="dose-frequency"
                className="input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value={1}>1 (once daily)</option>
                <option value={2}>2 (twice daily)</option>
                <option value={3}>3 (three times)</option>
                <option value={4}>4 (four times)</option>
                <option value={6}>6 (six times)</option>
              </select>
            </div>
          </div>

          {dosePerTablet && frequency && (
            <div
              style={{
                background: "var(--primary-light)",
                border: "1px solid var(--primary-border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                fontSize: 14,
                color: "var(--primary-dark)",
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Total daily dose: <strong>{dailyDoseMg}mg</strong>
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={handleCheck}
            disabled={loading || !medicineName || !dosePerTablet}
            id="check-dosage-btn"
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18 }} />
                Checking...
              </>
            ) : (
              "🔍 Check My Dosage"
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && status && (
          <div className="fade-in-up">
            {/* Status banner */}
            <div
              style={{
                background: status.bg,
                border: `2px solid ${status.border}`,
                borderRadius: "var(--radius-lg)",
                padding: 24,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 8 }}>{status.icon}</div>
              <h2
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: status.color,
                  marginBottom: 12,
                }}
              >
                {status.label}
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 24,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {result.safeDailyRange && (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                      STANDARD RANGE
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                      {result.safeDailyRange}mg/day
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                    YOUR DOSE
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: status.color }}>
                    {dailyDoseMg}mg/day
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)", margin: 0 }}>
                {result.explanation}
              </p>

            </div>

            {/* Danger-specific warning */}
            {result.status === "danger" && (
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                <span>🚨</span>
                <div>
                  <strong>POSSIBLE OVERDOSE</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 14 }}>
                    Your dose exceeds the safe range. Did your doctor prescribe this?
                    If <strong>yes</strong>, confirm at your next visit. If <strong>no</strong>,{" "}
                    <strong>DO NOT TAKE</strong> until you confirm with your doctor or pharmacist.
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer — always shown */}
            <div className="disclaimer" style={{ marginBottom: 16 }}>
              <span className="disclaimer-icon">ℹ️</span>
              <span>
                This is educational information only. <strong>Always ask your doctor</strong> if
                you&apos;re unsure. Never change your dose without your doctor&apos;s approval.
              </span>
            </div>

            {/* Action buttons */}
            {result.status === "danger" ? (
              <div className="grid-2">
                <a
                  href="tel:112"
                  className="btn btn-danger"
                  id="call-doctor-danger"
                >
                  🆘 Call Doctor Now
                </a>
                <button
                  className="btn btn-secondary"
                  onClick={() => setResult(null)}
                  id="back-to-check"
                >
                  ← Back to Check Again
                </button>
              </div>
            ) : (
              <div className="grid-2">
                <a href="tel:112" className="btn btn-ghost" id="call-doctor-btn">
                  📞 Call Doctor
                </a>
                <button
                  className="btn btn-primary"
                  onClick={() => router.back()}
                  id="understand-btn"
                >
                  ✓ I Understand
                </button>
              </div>
            )}
          </div>
        )}

        {!result && <Disclaimer className="mt-6" />}

        <div style={{ height: 24 }} />
      </div>
    </Layout>
  );
}
