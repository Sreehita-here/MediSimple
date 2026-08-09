import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "../lib/i18n";
import dynamic from "next/dynamic";

// Load ReminderSystem only on client side (uses Notification API)
const ReminderSystem = dynamic(() => import("../components/ReminderSystem"), {
  ssr: false,
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const publicRoutes = ["/", "/login"];
    
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        
        const isPublic = publicRoutes.includes(router.pathname);
        
        if (res.ok && data.authenticated) {
          // Logged in user going to home or login page gets redirected to app portal
          if (router.pathname === "/" || router.pathname === "/login") {
            router.push("/my-medicines");
          }
        } else {
          // Unauthenticated user attempting to access private platform gets redirected to login
          if (!isPublic) {
            router.push("/login");
          }
        }
      } catch (err) {
        if (!publicRoutes.includes(router.pathname)) {
          router.push("/login");
        }
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuth();
  }, [router.pathname]);

  const isPublic = ["/", "/login"].includes(router.pathname);

  // Prevent flash of private content during auth validation
  if (!authChecked && !isPublic) {
    return (
      <div 
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "Poppins, sans-serif",
          background: "var(--background)",
          color: "var(--text-primary)"
        }}
      >
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3, marginBottom: 16 }} />
        <p style={{ fontWeight: 500, fontSize: 15 }}>Loading your patient profile...</p>
      </div>
    );
  }

  return (
    <>
      <ReminderSystem />
      <Component {...pageProps} />
    </>
  );
}
