import Link from "next/link";
import Nav from "./components/Nav";

const layers = [
  {
    icon: "👥",
    title: "People",
    desc: "Staff behavior, training completions, who accessed what patient data and when.",
    href: "/people",
    color: "var(--blue)",
  },
  {
    icon: "🖥️",
    title: "Systems",
    desc: "EHR software, laptops, cloud tools, and AI tools — scanned for PHI exposure.",
    href: "/systems",
    color: "var(--amber)",
  },
  {
    icon: "🤝",
    title: "Vendors",
    desc: "Every third-party touching patient data — BAAs reviewed, risks flagged.",
    href: "/vendors",
    color: "var(--green)",
  },
  {
    icon: "📄",
    title: "Documents",
    desc: "Policies and contracts cross-referenced against the 2025 HIPAA NPRM requirements.",
    href: "/documents",
    color: "var(--accent)",
  },
  {
    icon: "🚨",
    title: "Incidents",
    desc: "Breaches, near-misses, suspicious access — detected and response-guided in real time.",
    href: "/incidents",
    color: "var(--red)",
  },
];

const stats = [
  { num: "180", label: "Days to comply after NPRM finalization (~May 2026)", color: "var(--red)" },
  { num: "$9B",  label: "Estimated year-1 compliance cost for US hospitals", color: "var(--red)" },
  { num: "59%",  label: "Of breaches involve third-party vendors — most go unaudited", color: "var(--amber)" },
  { num: "$13B", label: "Healthcare compliance software market by 2035", color: "var(--green)" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section style={{ padding: "6rem 0 4rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: "1.4rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "block", width: 28, height: 1, background: "var(--accent)" }} />
              Healthcare Compliance OS
            </div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2.4rem,5vw,3.8rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "1.4rem", color: "#fff" }}>
              HIPAA compliance<br />
              <span style={{ color: "var(--accent)" }}>enforced everywhere.</span>
            </h1>
            <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: "1.2rem", color: "var(--muted)", lineHeight: 1.6, maxWidth: 600, marginBottom: "2.4rem" }}>
              Not a checklist. Not a tool. An operating layer that sits inside your hospital and enforces HIPAA compliance across every person, system, vendor, document, and incident — automatically.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/dashboard" style={{
                background: "var(--accent)", color: "#0a0c0f", fontFamily: "'Syne',sans-serif",
                fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "0.8rem 1.8rem", borderRadius: 8, textDecoration: "none",
              }}>
                Open Dashboard →
              </Link>
              <Link href="/documents" style={{
                background: "transparent", color: "var(--text)", fontFamily: "'Syne',sans-serif",
                fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "0.8rem 1.8rem", borderRadius: 8, textDecoration: "none",
                border: "1px solid var(--border-hi)",
              }}>
                Analyze Your Policies
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              {stats.map(s => (
                <div key={s.num} style={{ background: "var(--bg-2)", padding: "1.6rem 1.4rem" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "2.2rem", fontWeight: 800, lineHeight: 1, marginBottom: "0.4rem", color: s.color }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5 Layers */}
        <section style={{ padding: "4rem 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 500, marginBottom: "0.5rem" }}>The OS layers</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>HIPAA enforced at every layer</h2>
              <p style={{ marginTop: "0.6rem", fontFamily: "'Instrument Serif',serif", fontSize: "1rem", color: "var(--muted)", lineHeight: 1.6, maxWidth: 560 }}>
                Five layers that together cover every surface where a HIPAA violation can occur.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
              {layers.map(l => (
                <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16,
                    padding: "1.8rem", position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: l.color }} />
                    <div style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>{l.icon}</div>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>{l.title}</h3>
                    <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{l.desc}</p>
                    <div style={{ marginTop: "1rem", fontSize: 12, color: l.color, fontWeight: 500 }}>Open layer →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* The big idea */}
        <section style={{ padding: "4rem 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
            <div style={{ background: "var(--green-bg)", border: "1px solid rgba(22,201,132,0.2)", borderRadius: 16, padding: "2.4rem" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: "0.8rem" }}>
                The immune system for your hospital&apos;s data.
              </div>
              <p style={{ fontSize: 13, color: "var(--green)", lineHeight: 1.7, maxWidth: 640 }}>
                Antivirus software doesn&apos;t ask you to manually check for viruses — it just runs, watches, and protects.{" "}
                <strong style={{ color: "#fff" }}>HIPAA Guard is that, but for every compliance surface in your hospital.</strong>{" "}
                Breaches get caught before they happen. Auditors find nothing to flag. Staff stay trained automatically. Vendors stay compliant without chasing them.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: "2.5rem 0", textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.08em" }}>
          HIPAA Guard — Healthcare Compliance OS &nbsp;·&nbsp; Built for Claude Code
        </div>
      </footer>
    </>
  );
}
