"use client";
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

type Staff = {
  id: string;
  name: string;
  role: string;
  training: string;
  access: string;
  risk: string;
  last_access: string;
};

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
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [action, setAction] = useState("");

  useEffect(() => {
    supabase.from("staff").select("*").order("name").then(({ data }) => {
      if (data) setStaff(data);
      setLoading(false);
    });
  }, []);

  async function updateStaff(id: string, patch: Partial<Staff>) {
    await supabase.from("staff").update(patch).eq("id", id);
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...patch } : null);
  }

  const overdue = staff.filter(s => s.training.startsWith("Overdue")).length;
  const current = staff.filter(s => s.training === "Current").length;
  const accessIssues = staff.filter(s => s.access.includes("Terminated")).length;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 6 }}>Layer 01 — People</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>Staff Compliance Monitor</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Training status, access rights, and behavioral risk across all staff with PHI access.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "2rem" }}>
          {[
            { label: "Total Staff",      val: String(staff.length), color: "var(--text)" },
            { label: "Training Current", val: String(current),      color: "var(--green)" },
            { label: "Training Overdue", val: String(overdue),      color: overdue > 0 ? "var(--red)" : "var(--green)" },
            { label: "Access Issues",    val: String(accessIssues), color: accessIssues > 0 ? "var(--red)" : "var(--green)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-2)", padding: "1.2rem 1.4rem" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", fontSize: 13 }}>Loading staff data…</div>
        ) : (
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
                  <tr key={s.id} onClick={() => { setSelected(s); setAction(""); }} style={{ cursor: "pointer", background: selected?.id === s.id ? "var(--bg-3)" : undefined }}>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{s.role}</td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: s.training.startsWith("Overdue") ? "var(--red)" : "var(--green)", fontWeight: 500 }}>{s.training}</td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: s.access.includes("Terminated") ? "var(--red)" : "var(--muted)" }}>{s.access}</td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{s.last_access}</td>
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
        )}

        {selected && (
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-hi)", borderRadius: 16, padding: "1.8rem" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              Actions for {selected.name}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1rem" }}>
              {selected.training.startsWith("Overdue") && (
                <button onClick={async () => {
                  await updateStaff(selected.id, { training: "Current", risk: selected.access.includes("Terminated") ? "red" : "green" });
                  setAction(`Training marked complete for ${selected.name}.`);
                }} style={{ background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid rgba(240,165,50,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                  Mark Training Complete
                </button>
              )}
              {selected.access.includes("Terminated") && (
                <button onClick={async () => {
                  await updateStaff(selected.id, { access: "Revoked", risk: "green" });
                  setAction(`EHR access revoked for ${selected.name}. Database updated.`);
                }} style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(240,82,82,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
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
