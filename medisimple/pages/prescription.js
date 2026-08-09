import Head from "next/head";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import Disclaimer from "../components/Disclaimer";

export default function PrescriptionPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [addingMeds, setAddingMeds] = useState({});
  const [addedMeds, setAddedMeds] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setError("Please upload an image (JPG, PNG, WebP) or PDF file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setFile(f);
    setError(null);
    setResult(null);

    // Generate preview
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null); // PDFs won't have an image preview
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          // Strip the data:...;base64, prefix
          const base64Data = dataUrl.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/prescription/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64,
          mimeType: file.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message || "Failed to analyze the prescription. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddToMeds = async (med, index) => {
    setAddingMeds((prev) => ({ ...prev, [index]: true }));
    try {
      await fetch("/api/user-medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: med.name,
          strength: med.strength || "",
          frequency: med.frequency || "As prescribed",
        }),
      });
      setAddedMeds((prev) => ({ ...prev, [index]: true }));
    } catch {
      alert("Failed to add medicine. Please try again.");
    } finally {
      setAddingMeds((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleAddAll = async () => {
    if (!result?.medicines) return;
    for (let i = 0; i < result.medicines.length; i++) {
      if (!addedMeds[i]) {
        await handleAddToMeds(result.medicines[i], i);
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setAddingMeds({});
    setAddedMeds({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Layout title="Scan Prescription">
      <Head>
        <title>Scan Prescription — MediSimple</title>
        <meta
          name="description"
          content="Upload a prescription photo or PDF to automatically extract and understand all your medicines."
        />
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
            📄 Scan Your Prescription
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Upload a photo or PDF of your prescription. We&apos;ll extract all medicines and explain them for you.
          </p>
        </div>

        {/* Upload Area */}
        {!result && (
          <>
            <div
              ref={dropZoneRef}
              className={`card fade-in-up`}
              style={{
                marginBottom: 16,
                border: dragOver ? "2px dashed var(--primary)" : "2px dashed var(--gray-300)",
                background: dragOver ? "var(--primary-light)" : "var(--gray-50)",
                textAlign: "center",
                padding: "40px 20px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*,.pdf"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {!file ? (
                <>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
                  <h3
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      marginBottom: 8,
                      color: "var(--text-primary)",
                    }}
                  >
                    Drop your prescription here
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
                    or click to browse files
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {["📸 Photo", "📄 PDF", "🖼️ Image"].map((t) => (
                      <span
                        key={t}
                        style={{
                          background: "var(--white)",
                          border: "1px solid var(--gray-200)",
                          borderRadius: 99,
                          padding: "4px 12px",
                          fontSize: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 12 }}>
                    Max file size: 10MB
                  </p>
                </>
              ) : (
                <div>
                  {preview && (
                    <img
                      src={preview}
                      alt="Prescription preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 300,
                        borderRadius: "var(--radius-md)",
                        marginBottom: 16,
                        border: "1px solid var(--gray-200)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>
                      {file.type === "application/pdf" ? "📄" : "🖼️"}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      ({(file.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    ✕ Remove & choose different file
                  </button>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              className="btn btn-primary btn-full btn-lg fade-in-up-delay-1"
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              style={{ marginBottom: 16 }}
            >
              {analyzing ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Analyzing prescription with AI...
                </>
              ) : (
                "🔍 Analyze Prescription"
              )}
            </button>

            {analyzing && (
              <div
                className="alert alert-info fade-in"
                style={{ textAlign: "center", marginBottom: 16 }}
              >
                <div>
                  <strong>🤖 AI is reading your prescription...</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                    This usually takes 5-15 seconds depending on the complexity.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-danger fade-in" style={{ marginBottom: 16, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px' }}>❌</span>
              <div>
                <strong>Analysis Failed</strong>
                <p style={{ margin: "4px 0 0", fontSize: 14 }}>
                  Error: Due to internal issues, we are unable to analyze your prescription automatically. Please do it manually.
                </p>
              </div>
            </div>
            
            <div style={{ 
              marginTop: 16, 
              padding: 16, 
              backgroundColor: 'var(--white)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid #FECACA'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--danger)', fontSize: 15 }}>Steps to add your medication manually:</h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: 8 }}>Go to the <strong>Home</strong> page and use the search bar.</li>
                <li style={{ marginBottom: 8 }}>Type the name of your medication and select it.</li>
                <li style={{ marginBottom: 8 }}>Click <strong>"🔍 Understand This Medicine"</strong> to view its details.</li>
                <li>Click <strong>"➕ Add to My Meds"</strong> to save it to your profile.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="fade-in-up">
            {/* Prescription Info Header */}
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                border: "1px solid var(--primary-border)",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h2
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 800,
                      fontSize: 22,
                      color: "var(--primary-darker)",
                      marginBottom: 8,
                    }}
                  >
                    📋 Prescription Analysis
                  </h2>
                  {result.doctorName && (
                    <p style={{ fontSize: 14, margin: "4px 0", color: "var(--text-primary)" }}>
                      <strong>Doctor:</strong> {result.doctorName}
                    </p>
                  )}
                  {result.patientName && (
                    <p style={{ fontSize: 14, margin: "4px 0", color: "var(--text-primary)" }}>
                      <strong>Patient:</strong> {result.patientName}
                    </p>
                  )}
                  {result.date && (
                    <p style={{ fontSize: 14, margin: "4px 0", color: "var(--text-primary)" }}>
                      <strong>Date:</strong> {result.date}
                    </p>
                  )}
                  {result.diagnosis && (
                    <p style={{ fontSize: 14, margin: "4px 0", color: "var(--text-primary)" }}>
                      <strong>Diagnosis:</strong> {result.diagnosis}
                    </p>
                  )}
                </div>
                <span className="badge badge-success" style={{ whiteSpace: "nowrap" }}>
                  ✅ {result.medicines?.length || 0} medicines found
                </span>
              </div>
            </div>

            {/* Medicine List */}
            {result.medicines && result.medicines.length > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    Medicines Found ({result.medicines.length})
                  </h3>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddAll}
                    disabled={Object.keys(addedMeds).length === result.medicines.length}
                  >
                    ➕ Add All to My Meds
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {result.medicines.map((med, i) => (
                    <div
                      key={i}
                      className="card"
                      style={{
                        borderLeft: `4px solid var(--primary)`,
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: 700,
                              fontSize: 17,
                              color: "var(--primary-dark)",
                              margin: 0,
                            }}
                          >
                            💊 {med.name}
                            {med.strength && (
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: "var(--text-secondary)",
                                  marginLeft: 8,
                                }}
                              >
                                {med.strength}
                              </span>
                            )}
                          </h4>
                        </div>
                        <span
                          style={{
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            borderRadius: 4,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          #{i + 1}
                        </span>
                      </div>

                      {/* Details */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        {med.frequency && (
                          <div
                            style={{
                              background: "var(--gray-50)",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 13,
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 2 }}>
                              FREQUENCY
                            </div>
                            {med.frequency}
                          </div>
                        )}
                        {med.duration && (
                          <div
                            style={{
                              background: "var(--gray-50)",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 13,
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 2 }}>
                              DURATION
                            </div>
                            {med.duration}
                          </div>
                        )}
                        {med.instructions && (
                          <div
                            style={{
                              background: "var(--gray-50)",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 13,
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 2 }}>
                              INSTRUCTIONS
                            </div>
                            {med.instructions}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link
                          href={{
                            pathname: "/explanation",
                            query: { name: med.name, strength: med.strength || "" },
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          🔍 Understand
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAddToMeds(med, i)}
                          disabled={addingMeds[i] || addedMeds[i]}
                        >
                          {addedMeds[i]
                            ? "✅ Added!"
                            : addingMeds[i]
                            ? "Adding..."
                            : "➕ Add to My Meds"}
                        </button>
                        <Link
                          href={{
                            pathname: "/side-effects",
                            query: { name: med.name },
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          📉 Side Effects
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <span>⚠️</span>
                <div>
                  <strong>No medicines detected</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 14 }}>
                    {result.error || "We couldn't find any medicines in this prescription. Please try a clearer image."}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid-2" style={{ gap: 10, marginBottom: 16 }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                📄 Scan Another Prescription
              </button>
              <Link href="/my-medicines" className="btn btn-primary">
                📋 View My Medicines
              </Link>
            </div>

            {/* AI Notice */}
            <div
              className="alert alert-info"
              style={{ marginBottom: 16 }}
            >
              <span>🤖</span>
              <span>
                This analysis was generated by AI. Always verify extracted
                medications against your physical prescription. Cross-check
                with your doctor or pharmacist if anything looks incorrect.
              </span>
            </div>

            <Disclaimer />
          </div>
        )}

        {!result && !analyzing && <Disclaimer className="mt-6" />}

        <div style={{ height: 40 }} />
      </div>
    </Layout>
  );
}
