"use client";
import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

type AuditMessage = { role: "user" | "assistant"; content: string };
type AuditState = {
  question: string;
  question_num: number;
  done: boolean;
  score?: number;
  feedback?: string;
  verdict?: string;
  top_risks?: string[];
};
type Incident = {
  id: string;
  date: string;
  type: string;
  description: string;
  status: string;
  severity: string;
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [tab, setTab] = useState<"incidents" | "audit">("incidents");
  const [auditStarted, setAuditStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AuditMessage[]>([]);
  const [currentState, setCurrentState] = useState<AuditState | null>(null);
  const [answer, setAnswer] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);

  useEffect(() => {
    supabase.from("incidents").select("*").order("date", { ascending: false }).then(({ data }) => {
      if (data) setIncidents(data);
      setIncidentsLoading(false);
    });
  }, []);

  async function callAudit(msgs: AuditMessage[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });
      const data: AuditState = await res.json();
      setCurrentState(data);
      if (data.score !== undefined) {
        setTotalScore(p => p + data.score!);
        setScoreHistory(h => [...h, data.score!]);
      }
    } catch {
      console.error("Audit call failed");
    } finally {
      setLoading(false);
    }
  }

  async function startAudit() {
    setAuditStarted(true);
    setMessages([]);
    setTotalScore(0);
    setScoreHistory([]);
    await callAudit([]);
  }

  async function submitAnswer() {
    if (!answer.trim() || !currentState) return;
    const userMsg: AuditMessage = { role: "user", content: answer };
    const assistantMsg: AuditMessage = {
      role: "assistant",
      content: JSON.stringify({ question: currentState.question, question_num: currentState.question_num }),
    };
    const newMsgs: AuditMessage[] = [...messages, assistantMsg, userMsg];
    setMessages(newMsgs);
    setAnswer("");
    await callAudit(newMsgs);
  }

  const maxScore = scoreHistory.length * 20;
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--red)", marginBottom: 6 }}>Layer 05 — Incidents</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>Incident Monitor & OCR Audit Simulator</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Track real incidents and simulate an OCR audit before the real one arrives.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: "2rem", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, width: "fit-content" }}>
          {(["incidents", "audit"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "var(--bg-3)" : "transparent", color: tab === t ? "var(--text)" : "var(--muted)", border: tab === t ? "1px solid var(--border-hi)" : "1px solid transparent", borderRadius: 8, padding: "0.5rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {t === "incidents" ? "Incident Log" : "OCR Audit Sim"}
            </button>
          ))}
        </div>

        {tab === "incidents" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "2rem" }}>
              {[
                { label: "Total",          val: String(incidents.length),                                        color: "var(--amber)" },
                { label: "Open",           val: String(incidents.filter(i => i.status === "Open").length),       color: "var(--green)" },
                { label: "OCR Reportable", val: String(incidents.filter(i => i.severity === "red").length),      color: "var(--red)" },
                { label: "Resolved",       val: String(incidents.filter(i => i.status === "Resolved").length),   color: "var(--blue)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg-2)", padding: "1.2rem 1.4rem" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {incidentsLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", fontSize: 13 }}>Loading incidents…</div>
            ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {incidents.map(inc => (
                <div key={inc.date} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.4rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>{inc.type}</span>
                      <span style={{ fontSize: 11, color: "var(--dim)" }}>{inc.date}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{inc.description}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, flexShrink: 0, color: inc.severity === "red" ? "var(--red)" : inc.severity === "amber" ? "var(--amber)" : "var(--green)", background: inc.severity === "red" ? "var(--red-bg)" : inc.severity === "amber" ? "var(--amber-bg)" : "var(--green-bg)", border: `1px solid ${inc.severity === "red" ? "rgba(240,82,82,0.2)" : inc.severity === "amber" ? "rgba(240,165,50,0.2)" : "rgba(22,201,132,0.2)"}` }}>
                    {inc.status}
                  </span>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {tab === "audit" && (
          <div>
            {!auditStarted ? (
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏛️</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.8rem" }}>OCR Audit Simulator</div>
                <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 480, margin: "0 auto 1.6rem", lineHeight: 1.6 }}>
                  The AI plays an OCR investigator and asks 5 real questions from the official audit protocol. Each answer is scored 0–20. See your readiness before the real auditor does.
                </p>
                <button onClick={startAudit} style={{ background: "var(--accent)", color: "#0a0c0f", border: "none", borderRadius: 8, padding: "0.8rem 2rem", fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                  Start OCR Simulation →
                </button>
              </div>
            ) : (
              <div>
                {/* Score bar */}
                {scoreHistory.length > 0 && (
                  <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.2rem 1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Running Score</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: pct >= 70 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }}>
                        {totalScore}/{maxScore}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)", borderRadius: 3, transition: "width 0.4s" }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Q{scoreHistory.length}/5</div>
                  </div>
                )}

                {/* Final verdict */}
                {currentState?.done && (
                  <div style={{ background: currentState.verdict === "Pass" ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${currentState.verdict === "Pass" ? "rgba(22,201,132,0.2)" : "rgba(240,82,82,0.2)"}`, borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", fontWeight: 800, color: currentState.verdict === "Pass" ? "var(--green)" : "var(--red)", marginBottom: "0.6rem" }}>
                      {currentState.verdict === "Pass" ? "✓ AUDIT PASSED" : "✗ AUDIT FAILED"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1rem" }}>Final score: {totalScore}/100 ({pct}%)</div>
                    {currentState.top_risks && (
                      <>
                        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8 }}>Top 3 risks to fix</div>
                        {currentState.top_risks.map((r, i) => (
                          <div key={i} style={{ fontSize: 13, color: "var(--text)", paddingLeft: 16, position: "relative", lineHeight: 1.6, marginBottom: 4 }}>
                            <span style={{ position: "absolute", left: 0, color: "var(--red)" }}>→</span>{r}
                          </div>
                        ))}
                      </>
                    )}
                    <button onClick={startAudit} style={{ marginTop: "1rem", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.5rem 1.2rem", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                      Run Again
                    </button>
                  </div>
                )}

                {/* Last feedback */}
                {currentState?.feedback && !currentState.done && (
                  <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.4rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 4 }}>OCR Investigator scored your answer: {currentState.score}/20</div>
                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{currentState.feedback}</div>
                  </div>
                )}

                {/* Current question */}
                {currentState && !currentState.done && (
                  <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-hi)", borderRadius: 16, padding: "1.8rem" }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "0.6rem" }}>Question {currentState.question_num} of 5 — OCR Investigator</div>
                    <div style={{ color: "#fff", lineHeight: 1.7, marginBottom: "1.2rem", fontFamily: "'Instrument Serif',serif", fontSize: "1rem" }}>
                      {currentState.question}
                    </div>
                    <textarea
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Type your answer here…"
                      rows={4}
                      style={{ width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-hi)", borderRadius: 8, padding: "0.8rem 1rem", fontSize: 13, color: "var(--text)", fontFamily: "'DM Mono',monospace", lineHeight: 1.6, resize: "vertical", outline: "none", marginBottom: "1rem" }}
                    />
                    <button onClick={submitAnswer} disabled={loading || !answer.trim()} style={{ background: "var(--accent)", color: "#0a0c0f", border: "none", borderRadius: 8, padding: "0.7rem 1.6rem", fontSize: 13, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Mono',monospace", fontWeight: 700, opacity: loading ? 0.6 : 1 }}>
                      {loading ? "Evaluating…" : "Submit Answer →"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
