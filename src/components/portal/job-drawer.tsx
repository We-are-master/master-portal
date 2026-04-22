"use client";

import { useState } from "react";
import { Icon } from "./icons";

interface JobDrawerProps {
  jobId: string;
  close: () => void;
}

const MOCK_JOB = {
  id: "JOB-2481",
  title: "Boiler pressure fault — no hot water",
  siteName: "Flat 4, 52 Marylebone Lane",
  postcode: "W1U 2NH",
  category: "Heating & Gas",
  priority: 1,
  priorityLbl: "P1 · Emergency",
  status: "onsite",
  statusLbl: "On Site",
  statusPill: "coral",
  operatorCo: "Finch Heating Co.",
  operator: "Marcus R. · GasSafe #412890",
  scheduled: "Today · 14:30",
  sla: "2h 18m remaining",
  slaPct: 68,
  approved: "£340.00",
  lastUpdate: "3 min ago",
  description: "Tenant reports no hot water since morning. Combi boiler (Worcester Greenstar 30si) showing F22 low pressure fault. Previously topped up in Feb — may indicate slow leak in system. Tenant available all afternoon.",
};

const TIMELINE = [
  { h: "Request created", m: "22 Apr · 11:04 by Priya Nair", b: "Via portal · auto-tagged P1 Emergency", done: true },
  { h: "Triaged by Fixfy", m: "22 Apr · 11:18", b: "Routed to GasSafe partners. Worcester Greenstar parts flagged.", done: true },
  { h: "Operator assigned", m: "22 Apr · 11:32", b: "Finch Heating Co. · Marcus R. (GasSafe #412890)", done: true },
  { h: "Quote submitted", m: "22 Apr · 12:40", b: "£340.00 — labour + likely expansion vessel", done: true },
  { h: "Quote auto-approved", m: "22 Apr · 12:41", b: "Under £500 threshold, approval rule applied", done: true },
  { h: "Scheduled", m: "22 Apr · 12:48", b: "Same-day · 14:30 arrival window", done: true },
  { h: "En route", m: "22 Apr · 14:04", b: "ETA 14:30", done: true },
  { h: "On site", m: "22 Apr · 14:42", b: "Marcus R. arrived · live", current: true },
  { h: "Work complete", m: "pending", b: "—" },
  { h: "Report uploaded", m: "pending", b: "—" },
  { h: "Invoice issued", m: "pending", b: "—" },
];

const AUDIT = [
  { t: "22 Apr · 14:42", who: "Marcus R.", a: "Status changed", d: "Scheduled → On Site" },
  { t: "22 Apr · 14:04", who: "Marcus R.", a: "Status changed", d: "Approved → En Route" },
  { t: "22 Apr · 12:48", who: "Fixfy", a: "Job scheduled", d: "Arrival window 14:30" },
  { t: "22 Apr · 12:41", who: "System", a: "Quote approved", d: "Auto-approved under £500 threshold" },
  { t: "22 Apr · 12:40", who: "Finch Heating", a: "Quote submitted", d: "£340.00 inc VAT" },
  { t: "22 Apr · 11:32", who: "Fixfy", a: "Operator assigned", d: "Finch Heating Co." },
  { t: "22 Apr · 11:18", who: "Fixfy", a: "Triaged", d: "Priority P1 confirmed" },
  { t: "22 Apr · 11:04", who: "Priya Nair", a: "Request created", d: "REQ-0482 via portal" },
];

export function JobDrawer({ jobId, close }: JobDrawerProps) {
  const [tab, setTab] = useState("overview");
  const job = MOCK_JOB; // TODO: fetch by jobId

  const TABS = [
    { id: "overview", lbl: "Overview" },
    { id: "timeline", lbl: "Timeline", c: 9 },
    { id: "quote", lbl: "Quote" },
    { id: "photos", lbl: "Photos", c: 6 },
    { id: "messages", lbl: "Messages", c: 4 },
    { id: "documents", lbl: "Documents", c: 3 },
    { id: "audit", lbl: "Audit", c: 14 },
  ];

  return (
    <div className="drawer-bg open" onClick={close}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-hdr">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span className={`pill ${job.statusPill} pill-lg`}><span className="d" />{job.statusLbl}</span>
              <span className={`priority p${job.priority}`} style={{ fontSize: 11 }}><span className="bar" />{job.priorityLbl}</span>
            </div>
            <h2>{job.title}</h2>
            <div className="m">{job.id} · {job.siteName} · {job.postcode}</div>
          </div>
          <button onClick={close} className="topbar-icon" style={{ background: "var(--slate-10)" }} type="button">
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: "0 24px" }}>
          <div className="dtabs">
            {TABS.map((t) => (
              <div key={t.id} className={`dtab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                {t.lbl}{t.c != null && <span className="c">{t.c}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {tab === "overview" && <OverviewTab job={job} />}
          {tab === "timeline" && <TimelineTab />}
          {tab === "quote" && <QuoteTab job={job} />}
          {tab === "photos" && <PhotosTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "documents" && <DocsTab />}
          {tab === "audit" && <AuditTab />}
        </div>

        {/* Footer */}
        <div className="drawer-ftr">
          <button className="btn btn-ghost">Print report</button>
          <button className="btn btn-ghost">Message operator</button>
          <button className="btn btn-primary">Mark complete</button>
        </div>
      </div>
    </div>
  );
}

function DL({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", paddingTop: 2 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{value}</div>
    </>
  );
}

function OverviewTab({ job }: { job: typeof MOCK_JOB }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px 20px", marginBottom: 20 }}>
        <DL label="Job ID" value={<span className="mono">{job.id}</span>} />
        <DL label="Site" value={<><b>{job.siteName}</b> · {job.postcode}</>} />
        <DL label="Category" value={job.category} />
        <DL label="Scheduled" value={job.scheduled} />
        <DL label="Operator" value={<><b>{job.operatorCo}</b><br /><span className="muted">{job.operator}</span></>} />
        <DL label="Est. / Approved" value={<><b>{job.approved}</b> <span className="pill ok" style={{ marginLeft: 6 }}>APPROVED</span></>} />
        <DL label="Last update" value={job.lastUpdate} />
      </div>
      <div style={{ background: "var(--slate-10)", border: "1px solid var(--line)", borderRadius: 6, padding: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 6 }}>ISSUE DESCRIPTION</div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>{job.description}</div>
      </div>
      <div className="grid-2">
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 8 }}>ACCESS</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>Tenant home all afternoon. Buzzer flat 4. Key safe code <b>4721</b> as backup. Contact: <b>Ms. L. Fairburn — 07700 900412</b>.</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 8 }}>SLA</div>
          <div className="sla" style={{ gap: 14 }}>
            <svg className="sla-ring" viewBox="0 0 36 36" style={{ width: 48, height: 48 }}>
              <circle className="bg" cx="18" cy="18" r="15" />
              <circle className="fg" cx="18" cy="18" r="15" strokeDasharray={`${job.slaPct * 0.942} 100`} />
            </svg>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{job.sla}</div>
              <div style={{ fontSize: 11, color: "var(--slate-50)", fontFamily: "var(--mono)" }}>P{job.priority} target · Response in 2h</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TimelineTab() {
  return (
    <div className="tl">
      {TIMELINE.map((t, i) => (
        <div key={i} className="tl-item">
          <div className={`tl-dot${t.current ? " current" : t.done ? " done" : ""}`} />
          <div className="h">{t.h}</div>
          <div className="m">{t.m}</div>
          <div className="b">{t.b}</div>
        </div>
      ))}
    </div>
  );
}

function QuoteTab({ job }: { job: typeof MOCK_JOB }) {
  return (
    <>
      <div className="block" style={{ border: "1px solid var(--line)" }}>
        <div className="block-hdr">
          <div>
            <h3>Quote from {job.operatorCo}</h3>
            <div className="sub">Submitted 22 Apr · 12:40 · Ref QTE-8821</div>
          </div>
          <span className="pill ok pill-lg"><span className="d" />Approved</span>
        </div>
        <table className="tbl quote-tbl">
          <thead><tr><th>Item</th><th style={{ textAlign: "right" }}>Qty</th><th style={{ textAlign: "right" }}>Rate</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
          <tbody>
            <tr><td><b>Labour</b><span className="sub">On-site diagnosis + repair, up to 2h</span></td><td style={{ textAlign: "right" }}>2h</td><td style={{ textAlign: "right" }} className="mono">£85.00</td><td style={{ textAlign: "right" }} className="mono">£170.00</td></tr>
            <tr><td><b>Expansion vessel</b><span className="sub">Likely replacement — inc. in scope</span></td><td style={{ textAlign: "right" }}>1</td><td style={{ textAlign: "right" }} className="mono">£95.00</td><td style={{ textAlign: "right" }} className="mono">£95.00</td></tr>
            <tr><td><b>Sundries</b><span className="sub">Fittings, sealant, flush</span></td><td style={{ textAlign: "right" }}>—</td><td style={{ textAlign: "right" }} className="mono">—</td><td style={{ textAlign: "right" }} className="mono">£18.00</td></tr>
            <tr><td className="muted">Subtotal</td><td /><td /><td style={{ textAlign: "right" }} className="mono">£283.00</td></tr>
            <tr><td className="muted">VAT 20%</td><td /><td /><td style={{ textAlign: "right" }} className="mono">£56.60</td></tr>
            <tr className="total"><td>Total</td><td /><td /><td style={{ textAlign: "right" }} className="mono">£340.00</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16, padding: 16, background: "#FFF5EE", border: "1px solid #FEE5D6", borderRadius: 6, fontSize: 13 }}>
        <b>Why Fixfy recommends this:</b> Finch Heating has completed 14 jobs on Worcester Greenstar combi boilers in the last 90 days with 100% first-fix rate. Quote is 12% below Fixfy benchmark for this category.
      </div>
    </>
  );
}

function PhotosTab() {
  return (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Before (3)</h3>
      <div className="photos">
        {[1, 2, 3].map((i) => (
          <div key={i} className="photo" style={{ background: "linear-gradient(135deg,#4A4A64,#1C1C32)" }}>
            <span className="ba">BEFORE</span>
            <span className="lbl">IMG_{2480 + i}.jpg</span>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 500, margin: "20px 0 10px" }}>After (3)</h3>
      <div className="photos">
        {[1, 2, 3].map((i) => (
          <div key={i} className="photo" style={{ background: "linear-gradient(135deg,#7A7A90,#4A4A64)" }}>
            <span className="ba" style={{ background: "var(--green)" }}>AFTER</span>
            <span className="lbl">IMG_{2490 + i}.jpg</span>
          </div>
        ))}
      </div>
    </>
  );
}

function MessagesTab() {
  return (
    <>
      <div className="msg-internal">
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 4 }}>INTERNAL NOTE</div>
        <div style={{ fontSize: 13 }}>Priya — this tenant flagged a similar fault in Feb. If it&apos;s a persistent leak, let&apos;s approve a full system flush at next visit. <span className="muted">— Oliver Hughes, Head Office Manager</span></div>
      </div>
      <div className="msg">
        <div className="ava coral">MR</div>
        <div style={{ flex: 1 }}>
          <div><span className="name">Marcus R.</span><span className="role">Operator · Finch Heating</span><span className="t">14:48</span></div>
          <div className="body">On site — confirmed low pressure as diagnosed. Expansion vessel failing. Beginning replacement, should be complete within the hour.</div>
        </div>
      </div>
      <div className="msg">
        <div className="ava" style={{ background: "var(--navy)" }}>PN</div>
        <div style={{ flex: 1 }}>
          <div><span className="name">Priya Nair</span><span className="role">You · Head of Operations</span><span className="t">14:52</span></div>
          <div className="body">Thanks Marcus. Please confirm when complete and upload photos of the replaced part.</div>
        </div>
      </div>
      <div className="msg">
        <div className="ava green">FX</div>
        <div style={{ flex: 1 }}>
          <div><span className="name">Fixfy</span><span className="role">System</span><span className="t">11:32</span></div>
          <div className="body">Operator assigned: Finch Heating Co. (Marcus R.) · GasSafe #412890 · Rating 4.9 · 142 jobs completed</div>
        </div>
      </div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <textarea placeholder="Send a message to Marcus or add an internal note…" style={{ flex: 1, minHeight: 70, padding: 10, border: "1px solid var(--line)", borderRadius: 5, fontFamily: "inherit", fontSize: 13, background: "#fff", color: "var(--ink)", outline: "none" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="btn btn-ghost btn-sm">Internal</button>
            <button className="btn btn-primary btn-sm">Send</button>
          </div>
        </div>
      </div>
    </>
  );
}

function DocsTab() {
  const docs = [
    { name: "Completion Report — JOB-2474.pdf", type: "pdf", size: "842 KB", uploaded: "21 Apr 26", by: "Sasha Patel" },
    { name: "Gas Safety Certificate CP12.pdf", type: "pdf", size: "1.2 MB", uploaded: "12 Feb 26", by: "Finch Heating" },
    { name: "Before — Kitchen drain.jpg", type: "img", size: "3.4 MB", uploaded: "21 Apr 26", by: "Sasha Patel" },
  ];
  return (
    <>
      {docs.map((d, i) => (
        <div key={i} className="doc-item" style={{ border: "1px solid var(--line)", borderRadius: 5, marginBottom: 8 }}>
          <div className={`doc-ic ${d.type}`}>{d.type.toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 500 }}>{d.name}</div>
            <div className="sub muted text-xs mono">{d.size} · uploaded {d.uploaded} by {d.by}</div>
          </div>
          <div /><div />
          <div style={{ color: "var(--slate-70)" }}><Icon name="download" size={14} /></div>
        </div>
      ))}
    </>
  );
}

function AuditTab() {
  return (
    <table className="tbl" style={{ fontSize: 12 }}>
      <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead>
      <tbody>
        {AUDIT.map((a, i) => (
          <tr key={i}>
            <td className="mono" style={{ fontSize: 11 }}>{a.t}</td>
            <td>{a.who}</td>
            <td className="bold">{a.a}</td>
            <td className="muted">{a.d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
