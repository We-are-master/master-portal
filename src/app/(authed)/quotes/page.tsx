"use client";

import { useState } from "react";
import { Icon } from "@/components/portal/icons";

const STATUSES: Record<string, { lbl: string; pill: string }> = {
  awaiting: { lbl: "Awaiting Approval", pill: "warn" },
  approved: { lbl: "Approved", pill: "ok" },
};

const QUOTES = [
  { id: "QTE-8824", job: "JOB-2479", title: "EICR — 5-year electrical inspection", site: "Office, 14 Exmouth Market", operator: "Volt Compliance Ltd", amount: "£485.00", submitted: "22 Apr · 13:54", status: "awaiting", expires: "23 Apr · 18:00" },
  { id: "QTE-8821", job: "JOB-2481", title: "Boiler pressure fault — no hot water", site: "Flat 4, 52 Marylebone Lane", operator: "Finch Heating Co.", amount: "£340.00", submitted: "22 Apr · 12:40", status: "approved", expires: "—" },
  { id: "QTE-8819", job: "JOB-2476", title: "Replace damaged double-glazed unit", site: "9 Pelham Place", operator: "Meridian Glazing", amount: "£620.00", submitted: "19 Apr · 11:02", status: "approved", expires: "—" },
  { id: "QTE-8812", job: "JOB-2465", title: "Replace WC cistern + internals", site: "Flat 6, 112 George Street", operator: "Finch Heating Co.", amount: "£210.00", submitted: "17 Apr · 09:18", status: "approved", expires: "—" },
  { id: "QTE-8808", job: "JOB-2471", title: "Communal lighting — stairwell fault", site: "Communal, Queen's Gate", operator: "Arc Electrical", amount: "£1,820.00", submitted: "22 Apr · 15:22", status: "awaiting", expires: "24 Apr · 17:00" },
];

export default function QuotesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = selected ? QUOTES.find((q) => q.id === selected) : null;

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Operations</div>
          <h1>Quotes &amp; Approvals</h1>
          <p className="sub"><b style={{ color: "var(--coral-600)" }}>2 quotes await your approval</b>. Approval rules applied: auto-approve under £500 for branch managers, over £500 needs head office.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm">Approval rules</button>
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Export</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Awaiting Approval</span><div className="value coral">2</div><div className="trend flat">Needs action</div></div>
        <div className="kpi"><span className="label">Approved (MTD)</span><div className="value">34</div><div className="trend up">↑ 18%</div></div>
        <div className="kpi"><span className="label">Avg. Approval Time</span><div className="value">2.1<span className="u">h</span></div><div className="trend up">↑ faster</div></div>
        <div className="kpi"><span className="label">Total Value (MTD)</span><div className="value" style={{ fontSize: 22 }}>£28,420</div><div className="trend up">↑ 8%</div></div>
      </div>

      <div className="split-2-1 mt-20">
        <div className="block">
          <div className="tbl-toolbar">
            <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search quotes…" /></div>
            <span className="filter-chip active">Awaiting <span className="v">2</span></span>
            <span className="filter-chip">Approved <span className="v">34</span></span>
            <span className="filter-chip">Rejected <span className="v">3</span></span>
          </div>
          <table className="tbl">
            <thead><tr><th>Quote</th><th>Site</th><th>Operator</th><th>Amount</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
              {QUOTES.map((q) => {
                const s = STATUSES[q.status] ?? { lbl: q.status, pill: "slate" };
                return (
                  <tr key={q.id} onClick={() => setSelected(q.id)} style={{ cursor: "pointer", background: selected === q.id ? "var(--slate-10)" : "" }}>
                    <td><div className="bold">{q.title}</div><span className="sub mono">{q.id} · {q.job}</span></td>
                    <td style={{ fontSize: 12 }}>{q.site}</td>
                    <td style={{ fontSize: 12 }}>{q.operator}</td>
                    <td className="bold mono">{q.amount}</td>
                    <td><span className={`pill ${s.pill}`}><span className="d" />{s.lbl}</span></td>
                    <td className="mono text-xs muted">{q.submitted}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          {!sel ? (
            <div className="block" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 28, color: "var(--slate-30)", marginBottom: 8 }}>£</div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Select a quote</div>
              <div style={{ fontSize: 12, color: "var(--slate-50)" }}>Click any row to review details and approve</div>
            </div>
          ) : (
            <div className="block">
              <div className="block-hdr">
                <div>
                  <h3 style={{ fontSize: 13 }}>{sel.id}</h3>
                  <div className="sub">Submitted {sel.submitted}</div>
                </div>
                <span className={`pill ${sel.status === "awaiting" ? "warn" : "ok"} pill-lg`}><span className="d" />{STATUSES[sel.status]?.lbl}</span>
              </div>
              <div className="block-body">
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{sel.title}</div>
                <div style={{ fontSize: 12, color: "var(--slate-50)", marginBottom: 14 }}>{sel.site} · <span style={{ color: "var(--coral-600)", cursor: "pointer" }}>{sel.job}</span></div>
                <div style={{ background: "var(--slate-10)", borderRadius: 6, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span className="muted">Labour (4h @ £85)</span><span className="mono">£340.00</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span className="muted">Test equipment</span><span className="mono">£60.00</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span className="muted">Certification</span><span className="mono">£24.17</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}><span className="muted">VAT 20%</span><span className="mono">£80.83</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 500, paddingTop: 8, borderTop: "1px solid var(--line)" }}><span>Total</span><span className="mono">{sel.amount}</span></div>
                </div>
                <div style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
                  <b>Scope:</b> Full 5-year EICR across 8 circuits. Test, inspect, record. Includes certification + remedial recommendations report.
                </div>
                <div style={{ background: "#FFF5EE", border: "1px solid #FEE5D6", borderRadius: 5, padding: 12, fontSize: 12, marginBottom: 14 }}>
                  <b style={{ color: "var(--coral-600)" }}>Fixfy benchmark:</b> {sel.amount} is 4% below market average for this category. {sel.operator} has 96% pass rate.
                </div>
                {sel.status === "awaiting" && (
                  <>
                    <div className="field"><label>Note to operator <span className="opt">optional</span></label><textarea placeholder="Any conditions, questions, or approval cap?" /></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Request changes</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: "var(--red)", borderColor: "#FEE2E2" }}>Reject</button>
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", marginTop: 6, justifyContent: "center" }}>✓ Approve {sel.amount}</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
