import Head from "next/head";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import MedicineSearchInput from "../components/MedicineSearchInput";
import Disclaimer from "../components/Disclaimer";

export default function MedicineInputPage() {
  const router = useRouter();
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [primaryMedicine, setPrimaryMedicine] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraNote, setCameraNote] = useState("");
  const fileInputRef = useRef(null);

  const handleSelect = (medicine) => {
    setPrimaryMedicine(medicine);
  };

  const handleAddMore = (medicine) => {
    if (!selectedMedicines.find((m) => m._id === medicine._id)) {
      setSelectedMedicines((prev) => [...prev, medicine]);
    }
  };

  const handleRemoveChip = (id) => {
    setSelectedMedicines((prev) => prev.filter((m) => m._id !== id));
  };

  const handleUnderstand = () => {
    if (!primaryMedicine) {
      alert("Please search and select a medicine first.");
      return;
    }
    router.push({
      pathname: "/explanation",
      query: { name: primaryMedicine.name, strength: primaryMedicine.strength },
    });
  };



  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCameraActive(true);
    setCameraNote("📸 Analyzing image. For demo, a mock result will be used.");
    
    setTimeout(() => {
      setCameraActive(false);
      setCameraNote("✅ Recognized: Paracetamol 500mg (mock demo result)");
      setPrimaryMedicine({ _id: "mock", name: "Paracetamol", strength: "500mg" });
      
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 2500);
  };

  return (
    <Layout title="Enter Your Medicine">
      <Head>
        <title>Search Medicine — MediSimple</title>
        <meta name="description" content="Search for any medicine to understand it clearly." />
      </Head>

      <div className="page-content">
        {/* Header */}
        <div className="fade-in" style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: "var(--text-primary)",
              marginBottom: 6,
            }}
          >
            💊 Enter Your Medicine
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Search by name to understand what you&apos;re taking.
          </p>
        </div>

        {/* Main Search */}
        <div className="card fade-in-up" style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="medicine-search">
              Medicine Name
            </label>
            <MedicineSearchInput
              id="medicine-search"
              onSelect={handleSelect}
              placeholder="🔍 Search or type medicine name..."
              allowFreeText={true}
            />
          </div>
          {primaryMedicine && (
            <div
              className="alert alert-success"
              style={{ marginTop: 12, marginBottom: 0 }}
            >
              <span>✅</span>
              <span>
                <strong>{primaryMedicine.name}</strong> {primaryMedicine.strength} selected
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="divider fade-in">OR</div>

        {/* Camera / Upload */}
        <div className="card fade-in-up-delay-1" style={{ marginBottom: 16 }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            className="btn btn-secondary btn-full"
            onClick={() => fileInputRef.current?.click()}
            id="camera-btn"
            style={{ marginBottom: cameraNote ? 12 : 0 }}
            disabled={cameraActive}
          >
            📸 {cameraActive ? "Analyzing..." : "Take / Upload Photo of Bottle"}
          </button>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>
            (Upload or take a photo to recognize text automatically)
          </p>
          {cameraNote && (
            <div
              className="alert alert-info"
              style={{ marginTop: 12, marginBottom: 0 }}
            >
              {cameraNote}
            </div>
          )}
        </div>

        {/* Pro tip */}
        <div
          className="fade-in"
          style={{
            background: "var(--warning-light)",
            border: "1px solid var(--warning-border)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--warning-text)",
            marginBottom: 24,
          }}
        >
          💡 <strong>Pro tip:</strong> A clear photo of the full label helps recognition accuracy!
        </div>

        {/* Primary Action */}
        <button
          className="btn btn-primary btn-full btn-lg fade-in-up-delay-2"
          onClick={handleUnderstand}
          disabled={!primaryMedicine}
          id="understand-btn"
          style={{ marginBottom: 12 }}
        >
          🔍 Understand This Medicine
        </button>



        {/* Quick Access */}
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <h3
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 12,
              color: "var(--text-secondary)",
            }}
          >
            Common Medicines:
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Paracetamol", "Ibuprofen", "Metformin", "Amlodipine", "Omeprazole", "Aspirin"].map((name) => (
              <button
                key={name}
                onClick={() => {
                  setPrimaryMedicine({ _id: name, name, strength: "" });
                  router.push({ pathname: "/explanation", query: { name } });
                }}
                style={{
                  padding: "7px 14px",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  border: "1px solid var(--primary-border)",
                  borderRadius: "var(--radius-full)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--primary)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--primary-light)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Disclaimer />
        </div>
      </div>
    </Layout>
  );
}
