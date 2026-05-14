"use client";
import { useState } from "react";
import Nav from "../components/Nav";

const systems = [
  { name: "Epic EHR",         type: "EHR Platform",    mfa: true,  encrypted: true,  baa: true,  lastAudit: "12 days ago", risk: "green", issue: null },
  { name: "ChatGPT (OpenAI)", type: "AI Tool",          mfa: false, encrypted: false, baa: false, lastAudit: "Never",       risk: "red",   issue: "Staff using with patient notes — no BAA exists. Instant HIPAA violation." },
  { name: "Microsoft Copilot",type: "AI Tool",          mfa: true,  encrypted: true,  baa: false, lastAudit: "Never",       risk: "red",   issue: "BAA not confirmed. PHI may be processed outside HIPAA scope." },
  { name: "AWS S3 (Patient)", type: "Cloud Storage",   mfa: true,  encrypted: true,  baa: true,  lastAudit: "31 days ago", risk: "green", issue: null },
  { name: "Staff Laptops",    type: "Endpoint",         mfa: false, encrypted: true,  baa: false, lastAudit: "47 days ago", risk: "amber", issue: "MFA not enforced on 12 of 34 laptops. Audit logs not reviewed." },
  { name: "Zoom (Telehealth)",type: "Communications",   mfa: true,  encrypted: true,  baa: true,  lastAudit: "5 days ago",  risk: "green", issue: null },
];

function Pill({ val, trueLabel, falseLabel }: { val: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, color: val ? "var(--green)" : "var(--red)", background: val ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${val ? "rgba(22,201,132,0.2)" : "rgba(240,82,82,0.2)"}` }}>
      {val ? trueLabel : falseLabel}
    </span>
  );
}

export default function SystemsPage() {
  const [selected, setSelected] = useState<typeof systems[0] | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>Layer 02 — Systems</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>System & AI Tool Scanner</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Every system touching PHI — scanned for MFA, encryption, BAA coverage, and shadow AI tools.</p>
        </div>

        {/* Critical alert */}
        <div style={{ background: "var(--red-bg)", border: "1px solid rgba(240,82,82,0.2)", borderRadius: 10, padding: "1rem 1.4rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 600, marginBottom: 4 }}>🚨 Shadow AI Detected</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>ChatGPT and Microsoft Copilot are in use on hospital systems with no BAA. Patient data may have been processed outside HIPAA protection.</div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: "2rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-3)" }}>
                {["System / Tool", "Type", "MFA", "Encrypted", "BAA", "Last Audit", "Risk"].map(h => (
                  <th key={h} style={{ padding: "0.9rem 1.2rem", textAlign: "left", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 500, borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systems.map(s => (
                <tr key={s.name} onClick={() => setSelected(s)} style={{ cursor: "pointer", background: selected?.name === s.name ? "var(--bg-3)" : undefined }}>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{s.type}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}><Pill val={s.mfa} trueLabel="On" falseLabel="Off" /></td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}><Pill val={s.encrypted} trueLabel="Yes" falseLabel="No" /></td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}><Pill val={s.baa} trueLabel="Signed" falseLabel="Missing" /></td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: s.lastAudit === "Never" ? "var(--red)" : "var(--muted)" }}>{s.lastAudit}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, color: s.risk === "red" ? "var(--red)" : s.risk === "amber" ? "var(--amber)" : "var(--green)", background: s.risk === "red" ? "var(--red-bg)" : s.risk === "amber" ? "var(--amber-bg)" : "var(--green-bg)", border: `1px solid ${s.risk === "red" ? "rgba(240,82,82,0.2)" : s.risk === "amber" ? "rgba(240,165,50,0.2)" : "rgba(22,201,132,0.2)"}` }}>
                      {s.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && selected.issue && !dismissed.includes(selected.name) && (
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-hi)", borderRadius: 16, padding: "1.8rem" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.6rem" }}>{selected.name} — Issue Detail</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.2rem", lineHeight: 1.6 }}>{selected.issue}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => setDismissed(d => [...d, selected.name])} style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(240,82,82,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                Block Tool Access
              </button>
              <button style={{ background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid rgba(79,142,247,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                Generate BAA Request Template
              </button>
              <button style={{ background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid rgba(240,165,50,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                Alert Compliance Officer
              </button>
            </div>
          </div>
        )}
        {selected && dismissed.includes(selected.name) && (
          <div style={{ background: "var(--green-bg)", border: "1px solid rgba(22,201,132,0.2)", borderRadius: 10, padding: "1rem 1.4rem", fontSize: 13, color: "var(--green)" }}>
            ✓ Access blocked for {selected.name}. Compliance officer notified.
          </div>
        )}
      </main>
    </>
  );
}
