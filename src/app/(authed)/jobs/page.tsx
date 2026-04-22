"use client";

import { useState } from "react";
import { Icon } from "@/components/portal/icons";
import { JobDrawer } from "@/components/portal/job-drawer";

const STATUSES: Record<string, { lbl: string; pill: string }> = {
  triage: { lbl: "Triage", pill: "slate" },
  quoting: { lbl: "Quote in Progress", pill: "blue" },
  awaiting: { lbl: "Awaiting Approval", pill: "warn" },
  approved: { lbl: "Approved", pill: "navy" },
  scheduled: { lbl: "Scheduled", pill: "navy" },
  onsite: { lbl: "On Site", pill: "coral" },
  completed: { lbl: "Completed", pill: "ok" },
  invoiced: { lbl: "Invoiced", pill: "slate" },
};

const JOBS = [
  { id: "JOB-2481", title: "Boiler pressure fault — no hot water", siteName: "Flat 4, 52 Marylebone Lane", postcode: "W1U 2NH", category: "Heating & Gas", priority: 1, status: "onsite", operatorCo: "Finch Heating Co.", operator: "Marcus R.", scheduled: "Today · 14:30", approved: "£340.00", slaPct: 68 },
  { id: "JOB-2479", title: "EICR — 5-year electrical inspection", siteName: "Office, 14 Exmouth Market", postcode: "EC1R 4QE", category: "Compliance", priority: 3, status: "awaiting", operatorCo: "Volt Compliance Ltd", operator: "—", scheduled: "24 Apr · 09:00", approved: "—", slaPct: 42 },
  { id: "JOB-2476", title: "Replace damaged double-glazed unit", siteName: "9 Pelham Place", postcode: "SW7 2NH", category: "Handyman", priority: 2, status: "scheduled", operatorCo: "Meridian Glazing", operator: "Liam O'Connor", scheduled: "25 Apr · 10:00", approved: "£620.00", slaPct: 86 },
  { id: "JOB-2474", title: "Blocked kitchen drain", siteName: "28A Cromwell Road", postcode: "SW7 2HR", category: "Plumbing", priority: 2, status: "completed", operatorCo: "Core Drainage", operator: "Sasha Patel", scheduled: "21 Apr · 15:00", approved: "£180.00", slaPct: 100 },
  { id: "JOB-2471", title: "Communal lighting — stairwell fault", siteName: "Communal, Queen's Gate", postcode: "SW7 5HW", category: "Electrical", priority: 2, status: "quoting", operatorCo: "Arc Electrical", operator: "—", scheduled: "—", approved: "—", slaPct: 24 },
  { id: "JOB-2468", title: "Post-tenancy deep clean", siteName: "18 Crawford Street", postcode: "W1H 1BT", category: "Cleaning", priority: 3, status: "invoiced", operatorCo: "Clean & Clear Ltd", operator: "—", scheduled: "17 Apr", approved: "£280.00", slaPct: 100 },
  { id: "JOB-2465", title: "Replace WC cistern + internals", siteName: "112 George Street", postcode: "W1H 5RH", category: "Plumbing", priority: 3, status: "approved", operatorCo: "Finch Heating Co.", operator: "—", scheduled: "Pending", approved: "£210.00", slaPct: 50 },
  { id: "JOB-2462", title: "Front door lock seized", siteName: "42 Upper Street", postcode: "N1 0PN", category: "Locks & Access", priority: 1, status: "completed", operatorCo: "CityKey Locksmiths", operator: "—", scheduled: "20 Apr", approved: "£165.00", slaPct: 100 },
  { id: "JOB-2459", title: "Washing machine intermittent fault", siteName: "52 Marylebone Lane", postcode: "W1U 2NH", category: "Appliances", priority: 3, status: "triage", operatorCo: "—", operator: "—", scheduled: "—", approved: "—", slaPct: 12 },
];

export default function JobsPage() {
  const [filter, setFilter] = useState("all");
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const filtered = filter === "all" ? JOBS : JOBS.filter((j) => j.status === filter);

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Operations</div>
          <h1>Jobs</h1>
          <p className="sub">Every live and historical job across your portfolio — with real-time status, SLA tracking, and full audit trail.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Export</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> New job</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">In Progress</span><div className="value">3</div><div className="trend flat">Live now</div></div>
        <div className="kpi"><span className="label">Scheduled</span><div className="value">2</div><div className="trend flat">Next 7 days</div></div>
        <div className="kpi"><span className="label">Awaiting Action</span><div className="value coral">4</div><div className="trend flat">Needs you</div></div>
        <div className="kpi"><span className="label">Completed (30d)</span><div className="value">41</div><div className="trend up">↑ 12%</div></div>
      </div>

      <div className="block mt-20">
        <div className="tbl-toolbar">
          <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search job ID, title, site…" /></div>
          {[
            { id: "all", lbl: "All", c: JOBS.length },
            { id: "onsite", lbl: "Live", c: 3 },
            { id: "awaiting", lbl: "Awaiting", c: 1 },
            { id: "scheduled", lbl: "Scheduled", c: 2 },
            { id: "completed", lbl: "Completed", c: 2 },
          ].map((f) => (
            <span key={f.id} className={`filter-chip${filter === f.id ? " active" : ""}`} onClick={() => setFilter(f.id)}>
              {f.lbl} <span className="v">{f.c}</span>
            </span>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--slate-50)" }}>{filtered.length} jobs</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Job</th><th>Site</th><th>Category</th><th>Priority</th><th>Status</th><th>Operator</th><th>Scheduled</th><th>Value</th><th>SLA</th><th></th></tr></thead>
          <tbody>
            {filtered.map((j) => {
              const s = STATUSES[j.status] ?? { lbl: j.status, pill: "slate" };
              return (
                <tr key={j.id} onClick={() => setOpenJobId(j.id)} style={{ cursor: "pointer" }}>
                  <td><div className="bold">{j.title}</div><span className="sub mono">{j.id}</span></td>
                  <td><div>{j.siteName}</div><span className="sub mono">{j.postcode}</span></td>
                  <td>{j.category}</td>
                  <td><span className={`priority p${j.priority}`}><span className="bar" />P{j.priority}</span></td>
                  <td><span className={`pill ${s.pill}`}><span className="d" />{s.lbl}</span></td>
                  <td style={{ fontSize: 12 }}>{j.operatorCo}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{j.scheduled}</td>
                  <td className="bold">{j.approved}</td>
                  <td>
                    <div className="sla">
                      <svg className="sla-ring" viewBox="0 0 36 36">
                        <circle className="bg" cx="18" cy="18" r="15" />
                        <circle className="fg" cx="18" cy="18" r="15" strokeDasharray={`${j.slaPct * 0.942} 100`} />
                      </svg>
                      <span className="txt" style={{ color: j.slaPct < 30 ? "var(--red)" : j.slaPct < 70 ? "var(--amber)" : "var(--green)" }}>{j.slaPct}%</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--slate-30)" }}><Icon name="arrow" size={12} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openJobId && <JobDrawer jobId={openJobId} close={() => setOpenJobId(null)} />}
    </div>
  );
}
