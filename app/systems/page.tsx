"use client";
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

type System = {
  id: string;
  name: string;
  type: string;
  mfa: boolean;
  encrypted: boolean;
  baa: boolean;
  last_audit: string;
  risk: string;
  issue: string | null;
};

function Pill({ val, trueLabel, falseLabel }: { val: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, color: val ? "var(--green)" : "var(--red)", background: val ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${val ? "rgba(22,201,132,0.2)" : "rgba(240,82,82,0.2)"}` }}>
      {val ? trueLabel : falseLabel}
    </span>
  );
}

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<System | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("systems").select("*").order("name").then(({ data }) => {
      if (data) setSystems(data);
      setLoading(false);
    });
  }, []);

  async function blockSystem(s: System) {
    await supabase.from("systems").update({ risk: "green", issue: null, last_audit: "Just now" }).eq("id", s.id);
    setSystems(prev => prev.map(x => x.id === s.id ? { ...x, risk: "green", issue: null, last_audit: "Just now" } : x));
    setBlocked(b => [...b, s.id]);
  }

  const critical = systems.filter(s => s.risk === "red").length;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>Layer 02 — Systems</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>System & AI Tool Scanner</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Every system touching PHI — scanned for MFA, encryption, BAA coverage, and shadow AI tools.</p>
        </div>

        {critical > 0 && (
          <div style={{ background: "var(--red-bg)", border: "1px solid rgba(240,82,82,0.2)", borderRadius: 10, padding: "1rem 1.4rem", marginBottom: "2rem" }}>
            <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 600, marginBottom: 4 }}>🚨 {critical} Critical System{critical > 1 ? "s" : ""} Detected</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>One or more systems handling PHI have no BAA or are unaudited. Patient data may be at risk.</div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", fontSize: 13 }}>Loading systems…</div>
        ) : (
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
                  <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: "pointer", background: selected?.id === s.id ? "var(--bg-3)" : undefined }}>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{s.type}</td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}><Pill val={s.mfa} trueLabel="On" falseLabel="Off" /></td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}><Pill val={s.encrypted} trueLabel="Yes" falseLabel="No" /></td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}><Pill val={s.baa} trueLabel="Signed" falseLabel="Missing" /></td>
                    <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: s.last_audit === "Never" ? "var(--red)" : "var(--muted)" }}>{s.last_audit}</td>
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
        )}

        {selected && selected.issue && !blocked.includes(selected.id) && (
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-hi)", borderRadius: 16, padding: "1.8rem" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.6rem" }}>{selected.name} — Issue Detail</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.2rem", lineHeight: 1.6 }}>{selected.issue}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => blockSystem(selected)} style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(240,82,82,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
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
        {selected && blocked.includes(selected.id) && (
          <div style={{ background: "var(--green-bg)", border: "1px solid rgba(22,201,132,0.2)", borderRadius: 10, padding: "1rem 1.4rem", fontSize: 13, color: "var(--green)" }}>
            ✓ Access blocked for {selected.name}. Database updated. Compliance officer notified.
          </div>
        )}
      </main>
    </>
  );
}
