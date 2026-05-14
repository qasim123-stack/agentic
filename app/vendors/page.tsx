"use client";
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

type Vendor = {
  id: string;
  name: string;
  type: string;
  baa_expiry: string;
  breach_clause: boolean;
  subcontractors: boolean;
  risk: string;
  exposure: string;
};

const draftAmendment = (name: string) => `BUSINESS ASSOCIATE AGREEMENT AMENDMENT

Effective Date: [DATE]
Parties: St. Mary's General Hospital ("Covered Entity") and ${name} ("Business Associate")

This Amendment updates the existing BAA to comply with the 2025 HIPAA Security Rule NPRM:

1. BREACH NOTIFICATION — §164.412
   Business Associate shall notify Covered Entity within TWENTY-FOUR (24) HOURS of
   discovery of a Breach of Unsecured PHI (updated from prior 60-day window).

2. MANDATORY ENCRYPTION — §164.312(a)(2)(iv)
   All ePHI at rest and in transit must be encrypted using AES-256 or equivalent.
   This specification is now MANDATORY (no longer addressable).

3. SUBCONTRACTOR OBLIGATIONS — §164.314(a)(2)(i)
   ${name} must obtain signed BAAs from all subcontractors before disclosing ePHI.

Signature: _________________ Date: _________`;

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    supabase.from("vendors").select("*").order("name").then(({ data }) => {
      if (data) setVendors(data);
      setLoading(false);
    });
  }, []);

  const totalExposure = vendors
    .filter(v => v.exposure !== "$0")
    .reduce((acc, v) => acc + parseFloat(v.exposure.replace(/[$KM]/g, "") || "0") * (v.exposure.includes("M") ? 1000 : 1), 0);

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 6 }}>Layer 03 — Vendors</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>Vendor BAA Intelligence</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Every vendor contract reviewed for 2026 compliance. Expired BAAs, missing breach clauses, and subcontractor gaps flagged.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "2rem" }}>
          {[
            { label: "Total Vendors",      val: String(vendors.length),                                  color: "var(--text)" },
            { label: "Compliant",          val: String(vendors.filter(v => v.risk === "green").length),  color: "var(--green)" },
            { label: "Needs Amendment",    val: String(vendors.filter(v => v.risk === "amber").length),  color: "var(--amber)" },
            { label: "Critical / Expired", val: String(vendors.filter(v => v.risk === "red").length),    color: "var(--red)" },
            { label: "Total Exposure",     val: `$${totalExposure.toFixed(0)}K`,                         color: "var(--red)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-2)", padding: "1.2rem 1.4rem" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", fontSize: 13 }}>Loading vendors…</div>
        ) : (
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: "2rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Vendor", "Type", "BAA Expiry", "24hr Breach Clause", "Subcontractor BAAs", "Fine Exposure", "Status"].map(h => (
                    <th key={h} style={{ padding: "0.9rem 1.2rem", textAlign: "left", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 500, borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => {
                  const expired = new Date(v.baa_expiry) < new Date();
                  return (
                    <tr key={v.id} onClick={() => { setSelected(v); setShowDraft(false); }} style={{ cursor: "pointer", background: selected?.id === v.id ? "var(--bg-3)" : undefined }}>
                      <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: 500 }}>{v.name}</td>
                      <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>{v.type}</td>
                      <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: expired ? "var(--red)" : "var(--muted)", fontWeight: expired ? 600 : 400 }}>
                        {v.baa_expiry}{expired ? " (EXPIRED)" : ""}
                      </td>
                      <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: v.breach_clause ? "var(--green)" : "var(--red)" }}>{v.breach_clause ? "✓ Yes" : "✗ Missing"}</td>
                      <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: v.subcontractors ? "var(--green)" : "var(--amber)" }}>{v.subcontractors ? "✓ Yes" : "Not confirmed"}</td>
                      <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)", color: v.exposure === "$0" ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{v.exposure}</td>
                      <td style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, color: v.risk === "red" ? "var(--red)" : v.risk === "amber" ? "var(--amber)" : "var(--green)", background: v.risk === "red" ? "var(--red-bg)" : v.risk === "amber" ? "var(--amber-bg)" : "var(--green-bg)", border: `1px solid ${v.risk === "red" ? "rgba(240,82,82,0.2)" : v.risk === "amber" ? "rgba(240,165,50,0.2)" : "rgba(22,201,132,0.2)"}` }}>
                          {v.risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selected && selected.risk !== "green" && (
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-hi)", borderRadius: 16, padding: "1.8rem" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              {selected.name} — BAA Issues
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1rem" }}>
              <button onClick={() => setShowDraft(true)} style={{ background: "var(--accent)", color: "#0a0c0f", border: "none", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                Draft BAA Amendment
              </button>
              <button style={{ background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid rgba(79,142,247,0.3)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                Send Renewal Request
              </button>
            </div>
            {showDraft && (
              <div style={{ background: "var(--bg-3)", border: "1px solid var(--border-hi)", borderRadius: 10, padding: "1.4rem", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {draftAmendment(selected.name)}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
