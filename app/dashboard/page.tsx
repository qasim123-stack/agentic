import Link from "next/link";
import Nav from "../components/Nav";

const layers = [
  {
    icon: "👥",
    title: "People",
    href: "/people",
    color: "var(--blue)",
    score: 72,
    status: "amber",
    statusLabel: "2 issues",
    items: ["3 staff overdue for HIPAA training", "1 terminated employee still has EHR access"],
  },
  {
    icon: "🖥️",
    title: "Systems",
    href: "/systems",
    color: "var(--amber)",
    score: 58,
    status: "red",
    statusLabel: "Critical",
    items: ["ChatGPT detected on 4 nursing workstations", "EHR audit logs not reviewed in 47 days"],
  },
  {
    icon: "🤝",
    title: "Vendors",
    href: "/vendors",
    color: "var(--green)",
    score: 81,
    status: "amber",
    statusLabel: "1 issue",
    items: ["AWS BAA expires in 14 days — no 24hr breach clause"],
  },
  {
    icon: "📄",
    title: "Documents",
    href: "/documents",
    color: "var(--accent)",
    score: 44,
    status: "red",
    statusLabel: "3 critical gaps",
    items: ["No MFA requirement in policy", "Missing technology asset inventory", "BAA audit frequency undefined"],
  },
  {
    icon: "🚨",
    title: "Incidents",
    href: "/incidents",
    color: "var(--red)",
    score: 90,
    status: "green",
    statusLabel: "All clear",
    items: ["Last incident: 23 days ago (resolved)", "No active breach notifications pending"],
  },
];

const overallScore = Math.round(layers.reduce((a, l) => a + l.score, 0) / layers.length);

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}

function statusColor(s: string) {
  if (s === "red") return "var(--red)";
  if (s === "amber") return "var(--amber)";
  return "var(--green)";
}
function statusBg(s: string) {
  if (s === "red") return "var(--red-bg)";
  if (s === "amber") return "var(--amber-bg)";
  return "var(--green-bg)";
}

export default function Dashboard() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "0.5rem" }}>Compliance OS</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>St. Mary&apos;s General Hospital — Live compliance status</p>
          </div>
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.4rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>Overall Score</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "2.8rem", fontWeight: 800, color: overallScore >= 75 ? "var(--green)" : overallScore >= 55 ? "var(--amber)" : "var(--red)" }}>
              {overallScore}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>out of 100</div>
          </div>
        </div>

        {/* Alert banner */}
        <div style={{ background: "var(--red-bg)", border: "1px solid rgba(240,82,82,0.2)", borderRadius: 10, padding: "1rem 1.4rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>2 critical issues require immediate attention. </span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>ChatGPT detected on nursing workstations + 3 policy gaps exposed to OCR audit risk.</span>
          </div>
        </div>

        {/* Layer cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
          {layers.map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.6rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: l.color }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.4rem" }}>{l.icon}</span>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{l.title}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "3px 10px", borderRadius: 20,
                    color: statusColor(l.status), background: statusBg(l.status),
                    border: `1px solid ${statusColor(l.status)}33`,
                  }}>
                    {l.statusLabel}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Compliance score</span>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: l.color }}>{l.score}/100</span>
                </div>
                <ScoreBar value={l.score} color={l.color} />
                <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 4 }}>
                  {l.items.map(item => (
                    <li key={item} style={{ fontSize: 12, color: "var(--muted)", paddingLeft: 14, position: "relative", lineHeight: 1.5 }}>
                      <span style={{ position: "absolute", left: 0, color: "var(--accent)", fontSize: 11 }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: "1rem", fontSize: 12, color: l.color, fontWeight: 500 }}>Investigate →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Regulatory clock */}
        <div style={{ marginTop: "2rem", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.6rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.4rem" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>HIPAA NPRM Deadline</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--amber)" }}>~Nov 2026</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>180 days after rule finalization</div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>Gaps to Fix</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--red)" }}>7</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Across all 5 layers</div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>Estimated Fine Exposure</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--red)" }}>$4.2M</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>If audited today, unfixed</div>
          </div>
        </div>
      </main>
    </>
  );
}
