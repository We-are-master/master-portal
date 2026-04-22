"use client";

import { useState } from "react";
import { Icon } from "@/components/portal/icons";

const SPEND_DATA = [
  { n: "Heating & Gas", pct: 82, v: "£6,840", c: 24 },
  { n: "Electrical", pct: 68, v: "£5,720", c: 18 },
  { n: "Plumbing", pct: 54, v: "£4,490", c: 22 },
  { n: "Compliance", pct: 48, v: "£3,980", c: 8 },
  { n: "Handyman", pct: 38, v: "£3,180", c: 14 },
  { n: "Cleaning", pct: 22, v: "£1,840", c: 9 },
  { n: "Locks & Access", pct: 18, v: "£1,520", c: 6 },
  { n: "Appliances", pct: 10, v: "£850", c: 4 },
];

const SITE_DATA = [
  { s: "Office, 14 Exmouth Market", j: 5, m: "£8,420", y: "£28,120", a: "£562", e: "20%" },
  { s: "Communal, Queen's Gate", j: 4, m: "£5,240", y: "£18,440", a: "£461", e: "15%" },
  { s: "Flat 4, 52 Marylebone Lane", j: 3, m: "£3,180", y: "£12,840", a: "£428", e: "33%" },
  { s: "Shopfront, 42 Upper Street", j: 2, m: "£2,440", y: "£9,240", a: "£462", e: "50%" },
  { s: "9 Pelham Place", j: 2, m: "£2,140", y: "£6,890", a: "£344", e: "0%" },
  { s: "28A Cromwell Road", j: 1, m: "£1,410", y: "£3,410", a: "£340", e: "0%" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("spend");

  const TABS = [
    { id: "spend", lbl: "Spend by category" },
    { id: "site", lbl: "Spend by site" },
    { id: "response", lbl: "Response time" },
    { id: "sla", lbl: "SLA performance" },
    { id: "recurring", lbl: "Recurring issues" },
    { id: "operators", lbl: "Operator performance" },
    { id: "branches", lbl: "Branch comparison" },
  ];

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Records</div>
          <h1>Reports</h1>
          <p className="sub">Operational + management reporting. Filter by branch, site, category, period. Export to PDF, CSV or Excel.</p>
        </div>
        <div className="actions">
          <span className="filter-chip">Period <span className="v">Last 30 days</span><Icon name="down" size={10} /></span>
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Export PDF</button>
          <button className="btn btn-primary btn-sm"><Icon name="download" size={13} /> Export CSV</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Total Spend</span><div className="value" style={{ fontSize: 24 }}>£28,420</div><div className="trend up">↑ 8% MoM</div></div>
        <div className="kpi"><span className="label">Jobs Completed</span><div className="value">41</div><div className="trend up">↑ 12%</div></div>
        <div className="kpi"><span className="label">Avg. Turnaround</span><div className="value">3.2<span className="u">d</span></div><div className="trend up">↑ faster</div></div>
        <div className="kpi"><span className="label">SLA Compliance</span><div className="value">94<span className="u">%</span></div><div className="trend up">↑ 6pp</div></div>
      </div>

      <div className="block mt-20">
        <div style={{ padding: "0 18px", borderBottom: "1px solid var(--line)" }}>
          <div className="dtabs" style={{ marginBottom: 0, border: 0 }}>
            {TABS.map((t) => (
              <div key={t.id} className={`dtab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>{t.lbl}</div>
            ))}
          </div>
        </div>
        <div className="block-body">
          {tab === "spend" && (
            <div className="grid-2">
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 10 }}>BY CATEGORY · 30 DAYS</div>
                <div className="hbar">
                  {SPEND_DATA.map((r, i) => (
                    <div key={i} className="hbar-row" style={{ gridTemplateColumns: "140px 1fr 80px" }}>
                      <div className="n">{r.n} <span className="muted text-xs">· {r.c} jobs</span></div>
                      <div className="t"><div className={`f ${i === 0 ? "coral" : ""}`} style={{ width: `${r.pct}%` }} /></div>
                      <div className="v">{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 10 }}>TREND · 12 WEEKS</div>
                <div className="chart-bars" style={{ height: 160 }}>
                  {[14, 12, 18, 15, 22, 19, 24, 16, 21, 26, 28, 24].map((v, i) => (
                    <div key={i} className="b" style={{ height: `${v * 4}px`, background: i === 11 ? "var(--coral)" : "var(--navy)" }}>
                      {i === 11 && <span className="v">£28k</span>}
                    </div>
                  ))}
                </div>
                <div className="chart-labels">{["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"].map((d, i) => <span key={i}>{d}</span>)}</div>
              </div>
            </div>
          )}

          {tab === "site" && (
            <table className="tbl">
              <thead><tr><th>Site</th><th>Jobs</th><th>Spend MTD</th><th>Spend YTD</th><th>Avg. per job</th><th>Emergency %</th></tr></thead>
              <tbody>
                {SITE_DATA.map((r, i) => (
                  <tr key={i}><td className="bold">{r.s}</td><td>{r.j}</td><td className="mono">{r.m}</td><td className="mono">{r.y}</td><td className="mono">{r.a}</td><td><span className={`pill ${parseInt(r.e) > 30 ? "red" : parseInt(r.e) > 15 ? "warn" : "slate"}`}>{r.e}</span></td></tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "response" && (
            <div className="grid-3">
              {[
                { p: "P1 Emergency", avg: "52m", target: "2h", pct: "98%" },
                { p: "P2 Urgent", avg: "8.4h", target: "24h", pct: "96%" },
                { p: "P3 Planned", avg: "1.8d", target: "7d", pct: "94%" },
              ].map((r, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: 18 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 10 }}>{r.p}</div>
                  <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em" }}>{r.avg}</div>
                  <div style={{ fontSize: 11, color: "var(--slate-50)", marginTop: 2 }}>Avg response · target {r.target}</div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ height: 6, background: "var(--slate-10)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: r.pct, height: "100%", background: "var(--green)" }} /></div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, marginTop: 4, color: "var(--green)" }}>{r.pct} within SLA</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!["spend", "site", "response"].includes(tab) && (
            <div className="empty"><div className="ic">📊</div><div className="t">{TABS.find((t) => t.id === tab)?.lbl}</div><div className="s">Coming soon — this report is being built.</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
