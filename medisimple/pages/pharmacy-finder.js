import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function PharmacyFinderPage() {
  const router = useRouter();
  const [medicineName, setMedicineName] = useState("");
  const [location, setLocation] = useState("Detecting...");
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.query.name) {
      setMedicineName(router.query.name);
    }
    
    // Mocking location and fetch (since Google Places isn't guaranteed)
    setTimeout(() => {
      setLocation("Indiranagar, Bangalore");
      setPharmacies([
        {
          id: 1,
          name: "Apollo Pharmacy",
          distance: "0.4 km",
          stock: "In Stock",
          hours: "Open until 11:00 PM",
          phone: "1800 123 4567"
        },
        {
          id: 2,
          name: "MedPlus",
          distance: "0.8 km",
          stock: "In Stock",
          hours: "24 Hours",
          phone: "1800 234 5678"
        },
        {
          id: 3,
          name: "Wellness Forever",
          distance: "1.2 km",
          stock: "Limited Stock",
          hours: "Open until 10:00 PM",
          phone: "1800 345 6789"
        }
      ]);
      setLoading(false);
    }, 1500);
  }, [router.query.name]);

  return (
    <Layout title="Pharmacy Finder">
      <Head>
        <title>Where to Buy — MediSimple</title>
        <meta name="description" content="Find nearby pharmacies stocking your medicine." />
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
            🏥 Where to Buy
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Find {medicineName ? <strong>{medicineName}</strong> : "your medicine"} at nearby pharmacies.
          </p>
        </div>

        <div className="card fade-in-up" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 0.5, marginBottom: 4 }}>
                YOUR LOCATION
              </div>
              <div style={{ fontWeight: 600, color: "var(--primary-dark)", display: "flex", alignItems: "center", gap: 6 }}>
                📍 {location}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm">🔍 Change</button>
          </div>
          
          <button className="btn btn-secondary btn-full">
            📍 Use My Exact GPS Location
          </button>
        </div>

        <h3
          className="fade-in-up"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 16,
          }}
        >
          Nearby Pharmacies (3 closest)
        </h3>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Searching nearby pharmacies...</p>
          </div>
        ) : (
          <div className="fade-in-up-delay-1" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pharmacies.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: 16,
                  borderLeft: `4px solid ${p.stock === "In Stock" ? "var(--success)" : "var(--warning)"}`
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h4 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 16, margin: 0, color: "var(--text-primary)" }}>
                    {p.name}
                  </h4>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                    {p.distance}
                  </span>
                </div>
                
                <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: p.stock === "In Stock" ? "var(--success-text)" : "var(--warning-text)", fontWeight: 600 }}>
                    {p.stock === "In Stock" ? "✅" : "⚠️"} {p.stock}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    🕒 {p.hours}
                  </span>
                </div>

                <div className="grid-3" style={{ gap: 8 }}>
                  <button className="btn btn-primary btn-sm">🗺️ Directions</button>
                  <a href={`tel:${p.phone.replace(/\s+/g, '')}`} className="btn btn-secondary btn-sm" style={{ textAlign: "center" }}>📞 Call</a>
                  <button className="btn btn-ghost btn-sm">🛒 Order</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
