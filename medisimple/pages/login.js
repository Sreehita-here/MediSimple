import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
    const body = isSignUp 
      ? { name, email, age: parseInt(age), password }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Successful login/signup, redirect to dashboard
      router.push("/my-medicines");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isSignUp ? "Sign Up" : "Log In"} showBack={false}>
      <Head>
        <title>{isSignUp ? "Sign Up" : "Log In"} — MediSimple</title>
        <meta name="description" content="Manage your medical prescriptions securely." />
      </Head>

      <div className="page-content" style={{ maxWidth: 440, margin: "40px auto 0" }}>
        {/* Banner Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }} className="fade-in">
          <span style={{ fontSize: 48 }}>🏥</span>
          <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 28, marginTop: 12, marginBottom: 4 }}>
            MediSimple
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: 0 }}>
            {isSignUp ? "Create a patient account to track your meds" : "Sign in to access your prescriptions"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger fade-in" style={{ marginBottom: 16 }}>
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="card fade-in-up">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {isSignUp && (
              <>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="auth-name">Full Name</label>
                  <input
                    type="text"
                    id="auth-name"
                    className="input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="auth-age">Age</label>
                  <input
                    type="number"
                    id="auth-age"
                    className="input"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </>
            )}

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="auth-email">Email Address</label>
              <input
                type="email"
                id="auth-email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="auth-password">Password</label>
              <input
                type="password"
                id="auth-password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Processing...
                </>
              ) : isSignUp ? (
                "Create Patient Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
            <span style={{ color: "var(--text-secondary)" }}>
              {isSignUp ? "Already have an account?" : "New to MediSimple?"}
            </span>{" "}
            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              {isSignUp ? "Log In instead" : "Sign Up now"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-secondary)" }}>
          🔒 Your medical data is encrypted and saved securely.
        </div>
      </div>
    </Layout>
  );
}
