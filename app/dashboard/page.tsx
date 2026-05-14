"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

type LayerSummary = {
  icon: string;
  title: string;
  href: string;
  color: string;
  score: number;
  status: string;
  statusLabel: string;
  items: string[];
};

function scoreColor(s: number) {
  if (s >= 75) return "var(--green)";
  if (s >= 55) return "var(--amber)";
  return "var(--red)";
}
function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}

export default function Dashboard() {
  const [layers, setLayers] = useState<LayerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { data: staff },
        { data: systems },
        { data: vendors },
        { data: incidents },
        { data: analyses },
      ] = await Promise.all([
        supabase.from("staff").select("*"),
        supabase.from("systems").select("*"),
        supabase.from("vendors").select("*"),
        supabase.from("incidents").select("*").order("date", { ascending: false }).limit(3),
        supabase.from("gap_analyses").select("overall_score").order("created_at", { ascending: false }).limit(1),
      ]);

      const overdueStaff = (staff ?? []).filter(s => s.training.startsWith("Overdue"));
      const accessIssues = (staff ?? []).filter(s => s.access.includes("Terminated"));
      const peopleScore = Math.max(0, 100 - overdueStaff.length * 15 - accessIssues.length * 20);

      const criticalSystems = (systems ?? []).filter(s => s.risk === "red");
      const systemScore = Math.max(0, 100 - criticalSystems.length * 20 - (systems ?? []).filter(s => s.risk === "amber").length * 10);

      const criticalVendors = (vendors ?? []).filter(v => v.risk === "red");
      const amberVendors = (vendors ?? []).filter(v => v.risk === "amber");
      const vendorScore = Math.max(0, 100 - criticalVendors.length * 15 - amberVendors.length * 8);

      const docScore = analyses && analyses.length > 0 ? analyses[0].overall_score : 44;

      const openIncidents = (incidents ?? []).filter(i => i.status === "Open");
      const incidentScore = Math.max(60, 100 - openIncidents.length * 20);

      const built: LayerSummary[] = [
        {
          icon: "👥", title: "People", href: "/people", color: "var(--blue)",
          score: peopleScore,
          status: overdueStaff.length > 0 || accessIssues.length > 0 ? "amber" : "green",
          statusLabel: overdueStaff.length + accessIssues.length > 0 ? `${overdueStaff.length + accessIssues.length} issues` : "All clear",
          items: [
            overdueStaff.length > 0 ? `${overdueStaff.length} staff overdue for HIPAA training` : "All training current",
            accessIssues.length > 0 ? `${accessIssues.length} terminated employee(s) with active EHR access` : "No access issues",
          ],
        },
        {
          icon: "🖥️", title: "Systems", href: "/systems", color: "var(--amber)",
          score: systemScore,
          status: criticalSystems.length > 0 ? "red" : "green",
          statusLabel: criticalSystems.length > 0 ? "Critical" : "All clear",
          items: criticalSystems.length > 0
            ? criticalSystems.slice(0, 2).map(s => `${s.name}: ${s.issue ?? "No BAA / unaudited"}`)
            : ["No critical systems detected"],
        },
        {
          icon: "🤝", title: "Vendors", href: "/vendors", color: "var(--green)",
          score: vendorScore,
          status: criticalVendors.length > 0 ? "red" : amberVendors.length > 0 ? "amber" : "green",
          statusLabel: criticalVendors.length > 0 ? `${criticalVendors.length} critical` : amberVendors.length > 0 ? `${amberVendors.length} issue(s)` : "All clear",
          items: [...criticalVendors, ...amberVendors].slice(0, 2).map(v => `${v.name}: ${v.exposure} exposure`) ?? ["All BAAs compliant"],
        },
        {
          icon: "📄", title: "Documents", href: "/documents", color: "var(--accent)",
          score: docScore,
          status: docScore < 50 ? "red" : docScore < 75 ? "amber" : "green",
          statusLabel: docScore < 50 ? "Critical gaps" : docScore < 75 ? "Gaps found" : "Compliant",
          items: docScore < 75
            ? ["Run a document analysis to see NPRM gap details"]
            : ["Last analysis passed — no critical gaps"],
        },
        {
          icon: "🚨", title: "Incidents", href: "/incidents", color: "var(--red)",
          score: incidentScore,
          status: openIncidents.length > 0 ? "red" : "green",
          statusLabel: openIncidents.length > 0 ? `${openIncidents.length} open` : "All clear",
          items: (incidents ?? []).slice(0, 2).map(i => `${i.date}: ${i.type} — ${i.status}`) ?? ["No recent incidents"],
        },
      ];

      setLayers(built);
      setLoading(false);
    }
    load();
  }, []);

  const overallScore = layers.length > 0 ? Math.round(layers.reduce((a, l) => a + l.score, 0) / layers.length) : 0;
  const criticalCount = layers.filter(l => l.status === "red").length;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "0.5rem" }}>Compliance OS</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>St. Mary&apos;s General Hospital — Live compliance status</p>
          </div>
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.4rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>Overall Score</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "2.8rem", fontWeight: 800, color: loading ? "var(--dim)" : scoreColor(overallScore) }}>
              {loading ? "—" : overallScore}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>out of 100</div>
          </div>
        </div>

        {!loading && criticalCount > 0 && (
          <div style={{ background: "var(--red-bg)", border: "1px solid rgba(240,82,82,0.2)", borderRadius: 10, padding: "1rem 1.4rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>{criticalCount} layer{criticalCount > 1 ? "s" : ""} require immediate attention. </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Click a layer card below to investigate and resolve.</span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)", fontSize: 13 }}>Loading live compliance data…</div>
        ) : (
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
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, color: l.status === "red" ? "var(--red)" : l.status === "amber" ? "var(--amber)" : "var(--green)", background: l.status === "red" ? "var(--red-bg)" : l.status === "amber" ? "var(--amber-bg)" : "var(--green-bg)", border: `1px solid ${l.status === "red" ? "rgba(240,82,82,0.2)" : l.status === "amber" ? "rgba(240,165,50,0.2)" : "rgba(22,201,132,0.2)"}` }}>
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
        )}

        {!loading && (
          <div style={{ marginTop: "2rem", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.6rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.4rem" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>HIPAA NPRM Deadline</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--amber)" }}>~Nov 2026</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>180 days after rule finalization</div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>Layers with Issues</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--red)" }}>
                {layers.filter(l => l.status !== "green").length}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Across all 5 layers</div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>Overall Readiness</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: scoreColor(overallScore) }}>
                {overallScore >= 75 ? "Good" : overallScore >= 55 ? "At Risk" : "Critical"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Based on live data</div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
