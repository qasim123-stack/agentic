"use client";
import { useState } from "react";
import Nav from "../components/Nav";

const staff = [
  { name: "Dr. Sarah Chen",       role: "Attending Physician",  training: "Overdue 14d", access: "Active",      risk: "amber", lastAccess: "Today, 09:14" },
  { name: "James Ortega",         role: "Nurse Practitioner",   training: "Current",     access: "Active",      risk: "green", lastAccess: "Today, 11:02" },
  { name: "Linda Park",           role: "Medical Records",      training: "Overdue 32d", access: "Active",      risk: "red",   lastAccess: "Yesterday"   },
  { name: "Tom Reyes",            role: "IT Administrator",     training: "Current",     access: "Active",      risk: "green", lastAccess: "Today, 08:45" },
  { name: "Maria Santos",         role: "Billing Coordinator",  training: "Overdue 7d",  access: "Active",      risk: "amber", lastAccess: "3 days ago"  },
  { name: "Eric Drummond",        role: "Radiologist",          training: "Current",     access: "Terminated ⚠️", risk: "red", lastAccess: "2 days ago"  },
];

function riskColor(r: string) {
  if (r === "red") return "var(--red)";
  if (r === "amber") return "var(--amber)";
  return "var(--green)";
}
function riskBg(r: string) {
  if (r === "red") return "var(--red-bg)";
  if (r === "amber") return "var(--amber-bg)";
  return "var(--green-bg)";
}

export default function PeoplePage() {
  const [selected, setSelected] = useState<typeof staff[0] | null>(null);
  const [action, setAction] = useState("");

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 6 }}>Layer 01 — People</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>Staff Compliance Monitor</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Training status, access rights, and behavioral risk across all staff with PHI access.</p>
        </div>

        {/* Summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "2rem" }}>
          {[
            { label: "Total Staff",       val: "6",  color: "var(--text)" },
            { label: "Training Current",  val: "3",  color: "var(--green)" },
            { label: "Training Overdue",  val: "3",  color: "var(--red)" },
            { label: "Access Issues",     val: "1",  color: "var(--red)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-2)", padding: "1.2rem 1.4rem" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Staff table */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: "2rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-3)" }}>
                {["Name", "Role", "HIPAA Training", "EHR Access", "Last PHI Access", "Risk"].map(h => (
                  <th key={h} style={{ padding: "0.9rem 1.2rem", textAlign: "left", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 500, borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.name} onClick={() => setSelected(s)} style={{ cursor: "pointer" }}>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{s.role}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: s.training.startsWith("Overdue") ? "var(--red)" : "var(--green)", fontWeight: 500 }}>{s.training}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: s.access.includes("Terminated") ? "var(--red)" : "var(--muted)" }}>{s.access}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{s.lastAccess}</td>
                  <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, color: riskColor(s.risk), background: riskBg(s.risk), border: `1px solid ${riskColor(s.risk)}33` }}>
                      {s.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action panel */}
        {selected && (
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-hi)", borderRadius: 16, padding: "1.8rem" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              Actions for {selected.name}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1rem" }}>
              {selected.training.startsWith("Overdue") && (
                <button onClick={() => setAction(`Training reminder sent to ${selected.name}.`)} style={{ background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid rgba(240,165,50,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                  Send Training Reminder
                </button>
              )}
              {selected.access.includes("Terminated") && (
                <button onClick={() => setAction(`EHR access revoked for ${selected.name}.`)} style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(240,82,82,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                  Revoke EHR Access Now
                </button>
              )}
              <button onClick={() => setAction(`Access audit report generated for ${selected.name}.`)} style={{ background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid rgba(79,142,247,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                Generate Access Audit
              </button>
            </div>
            {action && (
              <div style={{ background: "var(--green-bg)", border: "1px solid rgba(22,201,132,0.2)", borderRadius: 8, padding: "0.8rem 1.2rem", fontSize: 13, color: "var(--green)" }}>
                ✓ {action}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
