import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "ur", label: "اردو" },
];

export default function Layout({ children, title, showBack = true }) {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        // Safe to ignore
      }
    }
    checkAuth();
  }, []);

  const navItems = [
    { href: "/", icon: "🏠", label: "Home" },
    { href: "/medicine-input", icon: "🔍", label: "Search" },
    { href: "/prescription", icon: "📄", label: "Scan Rx" },
    { href: "/my-medicines", icon: "📋", label: "My Meds" },
    { href: "/settings", icon: "⚙️", label: "Settings" },
  ];

  const isActive = (href) => {
    if (href === "/" && router.pathname === "/") return true;
    if (href !== "/" && router.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showBack && router.pathname !== "/" && (
            <button
              className="navbar-back"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              ← Back
            </button>
          )}
          <Link href="/" className="navbar-brand">
            <span>🏥</span>
            <span>MediSimple</span>
          </Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-dark)" }}>
              👤 {user.name.split(" ")[0]}
            </span>
          ) : (
            <Link
              href="/login"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--primary)",
                background: "var(--primary-light)",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--primary-border)",
              }}
            >
              Log In
            </Link>
          )}

          <Link
            href="/settings"
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Settings"
          >
            ⚙️
          </Link>
        </div>
      </nav>

      {/* Page Content */}
      <main className="page-wrapper">{children}</main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${isActive(item.href) ? " active" : ""}`}
            aria-label={item.label}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
