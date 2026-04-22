"use client";

import { useState } from "react";
import { Icon } from "@/components/portal/icons";

const STATUSES: Record<string, { lbl: string; pill: string }> = {
  onsite: { lbl: "On Site", pill: "coral" },
  triage: { lbl: "Triage", pill: "slate" },
  quoting: { lbl: "Quote in Progress", pill: "blue" },
  awaiting: { lbl: "Awaiting Approval", pill: "warn" },
  scheduled: { lbl: "Scheduled", pill: "navy" },
  approved: { lbl: "Approved", pill: "navy" },
  invoiced: { lbl: "Invoiced", pill: "slate" },
};

const CATEGORIES = [
  { id: "plumbing", name: "Plumbing", ic: "P" },
  { id: "electrical", name: "Electrical", ic: "E" },
  { id: "handyman", name: "Handyman", ic: "H" },
  { id: "heating", name: "Heating & Gas", ic: "G" },
  { id: "cleaning", name: "Cleaning", ic: "C" },
  { id: "locks", name: "Locks & Access", ic: "L" },
  { id: "appliances", name: "Appliances", ic: "A" },
  { id: "flooring", name: "Flooring", ic: "F" },
  { id: "decorating", name: "Decorating", ic: "D" },
  { id: "compliance", name: "Compliance", ic: "◆" },
  { id: "gardening", name: "Gardening", ic: "G" },
  { id: "waste", name: "Waste Removal", ic: "W" },
];

const RECENT = [
  { id: "REQ-0482", title: "Boiler pressure fault — no hot water", site: "Flat 4, 52 Marylebone Lane", cat: "Heating & Gas", status: "onsite", priority: 1, created: "22 Apr · 11:04", jobRef: "JOB-2481" },
  { id: "REQ-0481", title: "Washing machine intermittent fault", site: "Flat 4, 52 Marylebone Lane", cat: "Appliances", status: "triage", priority: 3, created: "22 Apr · 09:48", jobRef: "JOB-2459" },
  { id: "REQ-0480", title: "Communal lighting — stairwell fault", site: "Communal, Queen's Gate", cat: "Electrical", status: "quoting", priority: 2, created: "22 Apr · 08:12", jobRef: "JOB-2471" },
  { id: "REQ-0479", title: "EICR — 5-year electrical inspection", site: "Office, 14 Exmouth Market", cat: "Compliance", status: "awaiting", priority: 3, created: "19 Apr · 10:32", jobRef: "JOB-2479" },
  { id: "REQ-0478", title: "Replace damaged double-glazed unit", site: "9 Pelham Place", cat: "Handyman", status: "scheduled", priority: 2, created: "18 Apr · 16:21", jobRef: "JOB-2476" },
  { id: "REQ-0477", title: "Replace WC cistern + internals", site: "Flat 6, 112 George Street", cat: "Plumbing", status: "approved", priority: 3, created: "16 Apr · 13:22", jobRef: "JOB-2465" },
  { id: "REQ-0476", title: "Post-tenancy deep clean", site: "Flat 2, 18 Crawford Street", cat: "Cleaning", status: "invoiced", priority: 3, created: "14 Apr · 14:48", jobRef: "JOB-2468" },
];

export default function RequestsPage() {
  const [view, setView] = useState<"list" | "new">("list");

  if (view === "new") return <NewRequest back={() => setView("list")} />;

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Operations</div>
          <h1>Requests</h1>
          <p className="sub">Every maintenance request logged against your portfolio. Each request becomes a trackable job once triaged by Fixfy.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Export</button>
          <button className="btn btn-primary" onClick={() => setView("new")}><Icon name="plus" size={13} /> New request</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Open</span><div className="value">14</div><div className="trend up">+3 this week</div></div>
        <div className="kpi"><span className="label">In Triage</span><div className="value">3</div><div className="trend flat">Under review</div></div>
        <div className="kpi"><span className="label">Awaiting Quote</span><div className="value">4</div><div className="trend flat">Avg 4h turnaround</div></div>
        <div className="kpi"><span className="label">Emergency</span><div className="value coral">2</div><div className="trend flat">This week</div></div>
      </div>

      <div className="block mt-20">
        <div className="tbl-toolbar">
          <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search requests, titles, sites…" /></div>
          <span className="filter-chip active">Status <span className="v">All</span><Icon name="down" size={10} /></span>
          <span className="filter-chip">Priority <span className="v">Any</span><Icon name="down" size={10} /></span>
          <span className="filter-chip">Category <span className="v">Any</span><Icon name="down" size={10} /></span>
          <span className="filter-chip">Site <span className="v">Any</span><Icon name="down" size={10} /></span>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--slate-50)" }}>{RECENT.length} of 128</div>
        </div>
        <table className="tbl">
          <thead><tr><th className="sortable">Request</th><th>Site</th><th>Category</th><th>Priority</th><th>Status</th><th className="sortable">Created</th><th></th></tr></thead>
          <tbody>
            {RECENT.map((r) => {
              const s = STATUSES[r.status] ?? { lbl: r.status, pill: "slate" };
              return (
                <tr key={r.id} style={{ cursor: "pointer" }}>
                  <td><div className="bold">{r.title}</div><span className="sub mono">{r.id} · linked {r.jobRef}</span></td>
                  <td>{r.site}</td>
                  <td>{r.cat}</td>
                  <td><span className={`priority p${r.priority}`}><span className="bar" />P{r.priority}</span></td>
                  <td><span className={`pill ${s.pill}`}><span className="d" />{s.lbl}</span></td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--slate-70)" }}>{r.created}</td>
                  <td style={{ color: "var(--slate-30)" }}><Icon name="arrow" size={12} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewRequest({ back }: { back: () => void }) {
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState("plumbing");
  const [priority, setPriority] = useState(3);

  return (
    <div className="page" style={{ maxWidth: 1080 }}>
      <div className="page-hdr">
        <div>
          <div className="kicker" style={{ cursor: "pointer" }} onClick={back}>&larr; Requests</div>
          <h1>Log a new request</h1>
          <p className="sub">Fixfy will triage, source a vetted operator, and return a quote or confirmation — typically within 2 hours.</p>
        </div>
      </div>

      <div className="stepper">
        {["Category", "Details", "Site & access", "Review"].map((s, i) => (
          <div key={i} className={`step${step === i + 1 ? " active" : step > i + 1 ? " done" : ""}`}>
            <div className="n">{step > i + 1 ? <Icon name="check" size={11} /> : i + 1}</div>
            <div className="t">{s}</div>
          </div>
        ))}
      </div>

      <div className="block">
        <div className="block-body" style={{ padding: "24px 28px" }}>
          {step === 1 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>What kind of issue is it?</h3>
              <p style={{ fontSize: 13, color: "var(--slate-50)", marginBottom: 20 }}>Pick the closest category — Fixfy will refine during triage if needed.</p>
              <div className="cat-grid">
                {CATEGORIES.map((c) => (
                  <button key={c.id} className={`cat${cat === c.id ? " selected" : ""}`} onClick={() => setCat(c.id)} type="button">
                    <div className="ic">{c.ic}</div>
                    <div className="t">{c.name}</div>
                    <div className="s">Avg response 3.2h</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Priority</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { p: 1, lbl: "P1 · Emergency", s: "Respond within 2h, any hour" },
                    { p: 2, lbl: "P2 · Urgent", s: "Next working day" },
                    { p: 3, lbl: "P3 · Planned", s: "Within 7 days" },
                    { p: 4, lbl: "P4 · Scheduled", s: "Book a date" },
                  ].map((pp) => (
                    <button
                      key={pp.p}
                      onClick={() => setPriority(pp.p)}
                      type="button"
                      style={{
                        padding: "12px 16px", border: `1px solid ${priority === pp.p ? "var(--coral)" : "var(--line)"}`,
                        borderRadius: 5, background: priority === pp.p ? "#FFF5EE" : "#fff",
                        textAlign: "left", cursor: "pointer", flex: "1 1 220px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className={`priority p${pp.p}`}><span className="bar" /></span>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{pp.lbl}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--slate-50)", marginTop: 2 }}>{pp.s}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Describe the issue</h3>
              <p style={{ fontSize: 13, color: "var(--slate-50)", marginBottom: 20 }}>The more detail, the faster we triage. Photos help our operators quote accurately.</p>
              <div className="grid-2">
                <div className="field"><label>Issue title</label><input defaultValue="Boiler pressure fault — no hot water" /></div>
                <div className="field"><label>Preferred date / time <span className="opt">optional</span></label><input type="text" placeholder="e.g. Tomorrow AM" /></div>
              </div>
              <div className="field"><label>Detailed description</label><textarea defaultValue="Tenant reports no hot water since this morning. Combi boiler showing F22 low pressure fault." /></div>
              <div className="field">
                <label>Photos / videos <span className="opt">recommended</span></label>
                <div className="upload"><div className="ic">↑</div><div className="t">Drop files here or click to browse</div><div className="s">JPG, PNG, MP4 · up to 25 MB each</div></div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Where and how do we access?</h3>
              <p style={{ fontSize: 13, color: "var(--slate-50)", marginBottom: 20 }}>Operator will be briefed exactly as written here.</p>
              <div className="grid-2">
                <div className="field"><label>Site / Property</label><select><option>Flat 4, 52 Marylebone Lane · W1U 2NH</option></select></div>
                <div className="field"><label>On-site contact</label><input defaultValue="Ms. L. Fairburn — 07700 900412" /></div>
                <div className="field"><label>Access instructions</label><textarea defaultValue="Tenant home all afternoon. Buzzer flat 4. Key safe code 4721 if needed." /></div>
                <div className="field"><label>Purchase order <span className="opt">optional</span></label><input placeholder="e.g. PO-2026-041" /></div>
                <div className="field"><label>Tenant present?</label><select><option>Yes — confirmed available</option><option>No — key access</option></select></div>
                <div className="field"><label>Landlord approval needed?</label><select><option>Auto-approve under £500</option><option>Always required</option></select></div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Review &amp; submit</h3>
              <p style={{ fontSize: 13, color: "var(--slate-50)", marginBottom: 20 }}>Fixfy triages and returns either an instant booking, a quote, or emergency deployment.</p>
              <div style={{ background: "var(--slate-10)", borderRadius: 6, padding: 20, marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px 16px", fontSize: 13 }}>
                  <div className="muted">Category</div><div><b>Heating &amp; Gas</b> · Boiler fault</div>
                  <div className="muted">Priority</div><div><span className="priority p1"><span className="bar" />P1 · Emergency</span> — Respond within 2h</div>
                  <div className="muted">Site</div><div><b>Flat 4, 52 Marylebone Lane</b> · W1U 2NH</div>
                  <div className="muted">Tenant</div><div>Ms. L. Fairburn — home all afternoon</div>
                  <div className="muted">Issue</div><div>Boiler pressure fault — no hot water. Worcester Greenstar 30si, F22.</div>
                  <div className="muted">Media</div><div>3 photos attached</div>
                  <div className="muted">Approval</div><div>Auto-approve under £500</div>
                </div>
              </div>
              <div style={{ background: "#FFF5EE", border: "1px solid #FEE5D6", borderRadius: 6, padding: 14, fontSize: 12, color: "var(--coral-600)" }}>
                <b>Expected next step:</b> Emergency response. Fixfy is sourcing a GasSafe engineer — you&apos;ll be notified within 30 minutes with an ETA.
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <button className="btn btn-ghost" onClick={() => step > 1 ? setStep(step - 1) : back()} type="button">&larr; {step > 1 ? "Back" : "Cancel"}</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" type="button">Save draft</button>
              <button className="btn btn-primary" onClick={() => step < 4 ? setStep(step + 1) : back()} type="button">
                {step < 4 ? <>Continue <Icon name="arrow" size={12} /></> : <>Submit request <Icon name="check" size={12} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
