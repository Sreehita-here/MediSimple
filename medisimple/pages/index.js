import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";

const features = [
  {
    icon: "✅",
    title: "Simple Explanations",
    desc: "No medical jargon. Just clear, easy language so you actually understand what you're taking.",
    color: "#D1FAE5",
    border: "#6EE7B7",
  },
  {
    icon: "🌍",
    title: "Multiple Languages",
    desc: "Hindi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Bengali, Marathi, Urdu and more.",
    color: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    icon: "🔊",
    title: "Audio Support",
    desc: "Listen to your medicine information anytime, anywhere — great for all literacy levels.",
    color: "#FEF3C7",
    border: "#FCD34D",
  },
  {
    icon: "💚",
    title: "100% Free",
    desc: "No login required, no hidden costs, no subscriptions. Forever free.",
    color: "#D1FAE5",
    border: "#6EE7B7",
  },
  {
    icon: "📄",
    title: "Doctor Reports",
    desc: "Export your medicine list to share with your doctor at your next appointment.",
    color: "#F3E8FF",
    border: "#D8B4FE",
  },
];

const testimonials = [
  {
    text: "This app explains my medicines better than my pharmacist. I finally understand what I'm taking and why.",
    author: "Ramesh K., Bangalore",
    stars: 5,
  },
  {
    text: "The Hindi explanation of my diabetes medicine was so clear. My whole family could understand it.",
    author: "Sunita M., Jaipur",
    stars: 5,
  },
  {
    text: "I used to forget my medicines all the time. The simple reminder system is a lifesaver.",
    author: "Anand P., Chennai",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <Layout showBack={false}>
      <Head>
        <title>MediSimple — Understand Your Medicine Clearly</title>
        <meta
          name="description"
          content="MediSimple explains your medicines in simple, no-jargon language. Know what you're taking, when to take it, and what to watch for."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #E8F4F8 50%, #EFF6FF 100%)",
          padding: "60px 20px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          {/* Logo */}
          <div
            className="fade-in"
            style={{
              fontSize: 64,
              marginBottom: 16,
              filter: "drop-shadow(0 4px 8px rgba(37,99,235,0.2))",
            }}
          >
            🏥
          </div>
          <h1
            className="fade-in-up"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 46px)",
              color: "#1E40AF",
              marginBottom: 8,
              lineHeight: 1.15,
            }}
          >
            MEDI<span style={{ color: "#2563EB" }}>SIMPLE</span>
          </h1>
          <p
            className="fade-in-up-delay-1"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(18px, 3vw, 24px)",
              color: "#374151",
              marginBottom: 20,
              fontStyle: "italic",
            }}
          >
            &ldquo;Understand Your Medicine Clearly&rdquo;
          </p>
          <p
            className="fade-in-up-delay-2"
            style={{
              fontSize: 17,
              color: "#4B5563",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 560,
              margin: "0 auto 36px",
            }}
          >
            Every prescription should come with clarity. MediSimple explains your
            medicines in simple, no-jargon language — so you know exactly what you&apos;re
            taking, when to take it, and what to watch out for.
          </p>
          <div className="fade-in-up-delay-3">
            <Link
              href="/login"
              className="btn btn-primary btn-lg"
              style={{ display: "inline-flex", fontSize: 18, gap: 10 }}
              id="hero-get-started"
            >
              🚀 Get Started — It&apos;s Free
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className="fade-in-up-delay-3"
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 28,
            }}
          >
            {["✅ Secure Patient Account", "🔒 Private & Secure", "🆓 Always Free"].map((b) => (
              <span
                key={b}
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid #E5E7EB",
                  borderRadius: 99,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{ padding: "64px 20px", background: "var(--white)", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(22px, 3.5vw, 30px)",
              color: "var(--text-primary)",
              marginBottom: 12,
            }}
          >
            Why Choose MediSimple?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Built for patients, not professionals — in the language you understand.
          </p>
        </div>

        <div className="grid-3" style={{ maxWidth: 1100, margin: "0 auto" }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`card fade-in-up-delay-${(i % 3) + 1}`}
              style={{
                border: `1px solid ${f.border}`,
                background: f.color,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  marginBottom: 8,
                  color: "var(--text-primary)",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        style={{
          background: "linear-gradient(135deg, #EFF6FF, #F9FAFB)",
          padding: "64px 20px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(22px, 3.5vw, 28px)",
              marginBottom: 48,
              color: "var(--text-primary)",
            }}
          >
            How It Works
          </h2>
          <div className="grid-3">
            {[
              { step: "1", title: "Enter Your Medicine", desc: "Type the name or take a photo of the bottle label", icon: "💊" },
              { step: "2", title: "Get Clear Explanation", desc: "Understand what it does, how to take it, and side effects", icon: "📋" },
              { step: "3", title: "Stay Safe", desc: "Track side effects, and share with your doctor", icon: "🛡️" },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: "var(--primary)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 28,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--primary)",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  STEP {item.step}
                </div>
                <h3
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "64px 20px", background: "var(--white)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px, 3vw, 26px)",
              textAlign: "center",
              marginBottom: 40,
              color: "var(--text-primary)",
            }}
          >
            What Patients Are Saying
          </h2>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="card"
                style={{
                  borderTop: "3px solid var(--primary)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ fontSize: 20, marginBottom: 12 }}>
                  {"⭐".repeat(t.stars)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#374151", marginBottom: 12, fontStyle: "italic" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, margin: 0 }}>
                  — {t.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6)",
          padding: "64px 20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(22px, 3.5vw, 30px)",
              marginBottom: 16,
            }}
          >
            Ready to Take Control of Your Medications?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 32, lineHeight: 1.6 }}>
            Join thousands of patients who now truly understand their medicines.
            No jargon. No confusion. Just clarity.
          </p>
          <Link
            href="/medicine-input"
            className="btn btn-lg"
            style={{
              background: "white",
              color: "var(--primary)",
              fontSize: 17,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
            id="bottom-get-started"
          >
            🚀 Get Started Free
          </Link>
          <p style={{ marginTop: 20, fontSize: 13, opacity: 0.75 }}>
            All your health information stays private and secure. No account needed.
          </p>
        </div>
      </section>
    </Layout>
  );
}
