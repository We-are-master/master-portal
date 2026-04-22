"use client";

import { Icon } from "@/components/portal/icons";

const COMPLIANCE = [
  { item: "Gas Safety (CP12)", site: "Flat 4, 52 Marylebone Lane", due: "12 May 26", status: "Due soon", rag: "a", pct: 78 },
  { item: "EICR — Electrical", site: "Office, 14 Exmouth Market", due: "04 May 26", status: "Overdue", rag: "r", pct: 100 },
  { item: "EPC", site: "Flat 2, 18 Crawford Street", due: "18 Aug 26", status: "Up to date", rag: "g", pct: 32 },
  { item: "PAT Testing", site: "Shopfront, 42 Upper Street", due: "28 Apr 26", status: "Due soon", rag: "a", pct: 92 },
  { item: "Fire Alarm Service", site: "Communal, Queen's Gate", due: "04 May 26", status: "Due soon", rag: "a", pct: 88 },
  { item: "Emergency Lighting", site: "Communal, Queen's Gate", due: "04 May 26", status: "Due soon", rag: "a", pct: 85 },
  { item: "Legionella Risk Assessment", site: "Communal, Queen's Gate", due: "12 Sep 26", status: "Up to date", rag: "g", pct: 18 },
  { item: "Gas Safety (CP12)", site: "Ground Floor, 9 Pelham Place", due: "02 Jul 26", status: "Up to date", rag: "g", pct: 48 },
  { item: "EICR — Electrical", site: "28A Cromwell Road", due: "14 Nov 27", status: "Up to date", rag: "g", pct: 8 },
  { item: "EPC", site: "Flat 6, 112 George Street", due: "29 Apr 26", status: "Due soon", rag: "a", pct: 95 },
];

export default function CompliancePage() {
  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Portfolio</div>
          <h1>Compliance</h1>
          <p className="sub"><b style={{ color: "var(--red)" }}>1 overdue</b>, <b style={{ color: "var(--amber)" }}>5 due within 30 days</b>. Full statutory compliance tracking across all properties.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Landlord report</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Book certificate</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Overdue</span><div className="value" style={{ color: "var(--red)" }}>1</div><div className="trend flat">Action needed</div></div>
        <div className="kpi"><span className="label">Due 30 days</span><div className="value coral">5</div><div className="trend flat">Upcoming</div></div>
        <div className="kpi"><span className="label">Up to date</span><div className="value" style={{ color: "var(--green)" }}>114</div><div className="trend up">94%</div></div>
        <div className="kpi"><span className="label">Total tracked</span><div className="value">120</div><div className="trend flat">Across 42 sites</div></div>
      </div>

      <div className="block mt-20">
        <div className="tbl-toolbar">
          <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search compliance items…" /></div>
          <span className="filter-chip active">All</span>
          <span className="filter-chip">Gas Safety</span>
          <span className="filter-chip">EICR</span>
          <span className="filter-chip">EPC</span>
          <span className="filter-chip">PAT</span>
          <span className="filter-chip">Fire</span>
          <span className="filter-chip">Legionella</span>
        </div>
        <div>
          <div className="comp-row" style={{ background: "var(--slate-10)", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)" }}>
            <div>Certificate</div><div>Property</div><div>Due date</div><div>Status</div><div>Validity</div><div>Doc</div>
          </div>
          {COMPLIANCE.map((c, i) => (
            <div key={i} className="comp-row">
              <div><div className="bold">{c.item}</div><div className="sub muted text-xs">Last issued 12 May 24</div></div>
              <div style={{ fontSize: 12 }}>{c.site}</div>
              <div className="mono text-xs">{c.due}</div>
              <div><span className={`pill ${c.rag === "r" ? "red" : c.rag === "a" ? "warn" : "ok"}`}><span className="d" />{c.status}</span></div>
              <div className="comp-bar"><div className={`f ${c.rag}`} style={{ width: `${c.pct}%` }} /></div>
              <div style={{ color: "var(--slate-70)" }}><Icon name="download" size={14} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
