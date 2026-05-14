"use client";
import { useState, useRef } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

type Gap = {
  id: string;
  title: string;
  severity: "critical" | "warning" | "pass";
  fine_exposure_usd: number;
  description: string;
  remediation: string;
};
type Analysis = {
  overall_score: number;
  summary: string;
  gaps: Gap[];
};

const SAMPLE_POLICY_URL = "/sample-policy.txt";

function severityColor(s: string) {
  if (s === "critical") return "var(--red)";
  if (s === "warning") return "var(--amber)";
  return "var(--green)";
}
function severityBg(s: string) {
  if (s === "critical") return "var(--red-bg)";
  if (s === "warning") return "var(--amber-bg)";
  return "var(--green-bg)";
}

export default function DocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [expandedGap, setExpandedGap] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function runAnalysis(text: string, filename = "Uploaded Policy") {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data);
      // Persist result to Supabase
      await supabase.from("gap_analyses").insert({
        filename,
        overall_score: data.overall_score,
        summary: data.summary,
        gaps: data.gaps,
      });
    } catch {
      setError("Analysis failed. Make sure ANTHROPIC_API_KEY is set in .env.local");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setDemoMode(true);
    const res = await fetch(SAMPLE_POLICY_URL);
    const text = await res.text();
    await runAnalysis(text, "Sample Hospital Policy");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await runAnalysis(text, file.name);
  }

  const critical = analysis?.gaps.filter(g => g.severity === "critical") ?? [];
  const warnings = analysis?.gaps.filter(g => g.severity === "warning") ?? [];
  const passes  = analysis?.gaps.filter(g => g.severity === "pass") ?? [];
  const totalExposure = analysis?.gaps.reduce((a, g) => a + g.fine_exposure_usd, 0) ?? 0;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>Layer 04 — Documents</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>HIPAA Policy Gap Analyzer</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Upload your policy document. AI cross-references every clause against all 180 requirements of the 2025 NPRM.</p>
        </div>

        {!analysis && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", background: "var(--bg-2)", border: "2px dashed var(--border-hi)", borderRadius: 16, marginBottom: "2rem", gap: "1.2rem" }}>
            <div style={{ fontSize: "2.5rem" }}>📄</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Drop your HIPAA policy document here</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Accepts .txt, .pdf (text), .docx — or use the sample policy below</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => fileRef.current?.click()} style={{ background: "var(--accent)", color: "#0a0c0f", border: "none", borderRadius: 8, padding: "0.7rem 1.4rem", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                Upload Policy
              </button>
              <button onClick={handleDemo} style={{ background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid rgba(79,142,247,0.3)", borderRadius: 8, padding: "0.7rem 1.4rem", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                Use Sample Policy (Demo)
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.docx" onChange={handleFile} style={{ display: "none" }} />
            {error && <div style={{ fontSize: 13, color: "var(--red)" }}>{error}</div>}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, gap: "1rem" }}>
            <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Analyzing against 180 NPRM requirements{demoMode ? " (sample policy)" : ""}…</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {analysis && (
          <>
            {/* Score summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "2rem" }}>
              {[
                { label: "Compliance Score",  val: `${analysis.overall_score}/100`, color: analysis.overall_score >= 75 ? "var(--green)" : analysis.overall_score >= 50 ? "var(--amber)" : "var(--red)" },
                { label: "Critical Gaps",     val: String(critical.length),         color: critical.length > 0 ? "var(--red)" : "var(--green)" },
                { label: "Warnings",          val: String(warnings.length),         color: warnings.length > 0 ? "var(--amber)" : "var(--green)" },
                { label: "Passed",            val: String(passes.length),           color: "var(--green)" },
                { label: "Total Exposure",    val: `$${(totalExposure/1000).toFixed(0)}K`, color: "var(--red)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg-2)", padding: "1.2rem 1.4rem" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.4rem", marginBottom: "2rem", color: "var(--muted)", fontFamily: "'Instrument Serif',serif", fontSize: "1rem" }}>
              {analysis.summary}
            </div>

            {/* Gap list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.gaps.map(gap => (
                <div key={gap.id} style={{ background: "var(--bg-2)", border: `1px solid ${gap.severity === "critical" ? "rgba(240,82,82,0.2)" : gap.severity === "warning" ? "rgba(240,165,50,0.2)" : "rgba(22,201,132,0.15)"}`, borderRadius: 12, overflow: "hidden" }}>
                  <div onClick={() => setExpandedGap(expandedGap === gap.id ? null : gap.id)} style={{ padding: "1.2rem 1.4rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, color: severityColor(gap.severity), background: severityBg(gap.severity), border: `1px solid ${severityColor(gap.severity)}33`, flexShrink: 0 }}>
                        {gap.severity}
                      </span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{gap.title}</span>
                        <span style={{ fontSize: 11, color: "var(--dim)", marginLeft: 8 }}>{gap.id}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      {gap.fine_exposure_usd > 0 && (
                        <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>${(gap.fine_exposure_usd/1000).toFixed(0)}K exposure</span>
                      )}
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{expandedGap === gap.id ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {expandedGap === gap.id && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "1.2rem 1.4rem" }}>
                      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: "1rem" }}>{gap.description}</div>
                      <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8 }}>Remediation — paste into your policy</div>
                      <div style={{ background: "var(--bg-3)", border: "1px solid var(--border-hi)", borderRadius: 8, padding: "1rem 1.2rem", fontSize: 12, color: "var(--text)", lineHeight: 1.7, fontFamily: "'DM Mono',monospace", whiteSpace: "pre-wrap" }}>
                        {gap.remediation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => { setAnalysis(null); setDemoMode(false); }} style={{ marginTop: "2rem", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.6rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
              ← Analyze another document
            </button>
          </>
        )}
      </main>
    </>
  );
}
