import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function MedicineCardPage() {
  const router = useRouter();
  const { name, strength } = router.query;
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!name) return;
    fetchMedicine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const fetchMedicine = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medicines/${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setMedicine(data.medicine);
      } else {
        // Try Groq fallback
        const groqRes = await fetch("/api/groq/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicineName: name, strength }),
        });
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          setMedicine(groqData.data);
        }
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (typeof window === "undefined") return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = cardRef.current;
      const options = {
        margin: 5,
        filename: `MediSimple_${name || "Medicine"}_Card.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "landscape", unit: "mm", format: [100, 70] },
      };
      html2pdf().set(options).from(element).save();
    } catch {
      window.print();
    }
  };

  const handleShare = async () => {
    const text = medicine
      ? `MediSimple — ${medicine.name} ${medicine.strength}\n\nWhat it does: ${medicine.whatItDoes}\n\nHow to take: ${medicine.howToTake?.join("; ")}\n\n⚠️ Educational info only. Always ask your doctor.`
      : "Check MediSimple for medicine information.";

    if (navigator.share) {
      navigator.share({ title: "Medicine Card", text });
    } else {
      navigator.clipboard?.writeText(text);
      alert("Medicine info copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <Layout title="Medicine Card">
        <div className="loading-container">
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <p>Loading medicine card...</p>
        </div>
      </Layout>
    );
  }

  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout title="Medicine Card">
      <Head>
        <title>Medicine Card — {name} — MediSimple</title>
        <meta name="description" content={`Printable medicine card for ${name}`} />
      </Head>

      <div className="page-content">
        {/* Controls */}
        <div className="fade-in" style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            🖨️ Medicine Card
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            A compact, printable card with essential medicine information.
          </p>
        </div>

        <div className="input-group fade-in" style={{ marginBottom: 16 }}>
          <label className="input-label" htmlFor="patient-name-input">
            Patient Name (optional)
          </label>
          <input
            id="patient-name-input"
            type="text"
            className="input"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Your name (optional)"
          />
        </div>

        {/* Card Preview */}
        <div
          ref={cardRef}
          className="medicine-card-print fade-in-up"
          style={{ marginBottom: 20 }}
        >
          {/* Card Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1E40AF, #2563EB)",
              margin: "-24px -24px 20px",
              padding: "20px 24px",
              borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
              color: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 4 }}>💊</div>
                <h2
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 800,
                    fontSize: 22,
                    margin: 0,
                  }}
                >
                  {medicine?.name || name}
                  {(medicine?.strength || strength) && (
                    <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 8, opacity: 0.9 }}>
                      {medicine?.strength || strength}
                    </span>
                  )}
                </h2>
                {medicine?.condition && (
                  <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: 14 }}>
                    For: {medicine.condition}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right", fontSize: 12, opacity: 0.8 }}>
                {patientName && <div style={{ fontWeight: 600 }}>{patientName}</div>}
                <div>{today}</div>
                <div style={{ marginTop: 4 }}>🏥 MediSimple</div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          {medicine ? (
            <>
              {/* What for */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.5, marginBottom: 4 }}>
                  WHAT IT DOES
                </div>
                <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>{medicine.whatItDoes}</p>
              </div>

              {/* How to take */}
              {medicine.howToTake?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.5, marginBottom: 6 }}>
                    HOW TO TAKE
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {medicine.howToTake.slice(0, 4).map((step, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 13,
                          display: "flex",
                          gap: 6,
                          marginBottom: 4,
                          lineHeight: 1.4,
                        }}
                      >
                        <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Side effects */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {medicine.sideEffects?.common?.length > 0 && (
                  <div
                    style={{
                      background: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success-text)", marginBottom: 4 }}>
                      🟢 COMMON EFFECTS
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {medicine.sideEffects.common.slice(0, 3).map((e, i) => (
                        <li key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 2 }}>
                          • {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {medicine.sideEffects?.serious?.length > 0 && (
                  <div
                    style={{
                      background: "#FFF1F2",
                      border: "1px solid #FECDD3",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>
                      🔴 CALL DOCTOR IF
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {medicine.callDoctorIf?.slice(0, 3).map((e, i) => (
                        <li key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 2 }}>
                          • {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Storage */}
              {medicine.storage && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.5, marginBottom: 4 }}>
                    STORAGE
                  </div>
                  <p style={{ fontSize: 13, margin: 0 }}>{medicine.storage}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 11,
                  color: "#78350F",
                  lineHeight: 1.4,
                }}
              >
                ⚠️ Educational info only. Always consult your doctor for medical decisions. — MediSimple
              </div>
            </>
          ) : (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-secondary)" }}>
              <p>Medicine information not available.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid-2" style={{ gap: 10 }} >
          <button
            className="btn btn-primary"
            onClick={handlePrint}
            id="print-pdf-btn"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleShare}
            id="share-card-btn"
          >
            📤 Share Card
          </button>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </Layout>
  );
}
