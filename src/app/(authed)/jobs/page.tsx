"use client";

import { useState } from "react";
import { JobDrawer } from "@/components/portal/job-drawer";
import { JOBS_ALL, RECURRING, type JobStatus } from "@/lib/mocks/portal-v2";

type TabId = JobStatus | "recurring";

const TABS: { id: TabId; l: string }[] = [
  { id: "upcoming", l: "Upcoming" },
  { id: "in_progress", l: "In Progress" },
  { id: "awaiting_report", l: "Awaiting Report" },
  { id: "completed", l: "Completed" },
  { id: "cancelled", l: "Cancelled" },
  { id: "recurring", l: "Recurring" },
];

function statusPill(s: JobStatus) {
  if (s === "in_progress") return { cls: "c", label: "In progress" };
  if (s === "awaiting_report") return { cls: "w", label: "Awaiting report" };
  if (s === "upcoming") return { cls: "b", label: "Upcoming" };
  if (s === "completed") return { cls: "ok", label: "Completed" };
  return { cls: "r", label: "Cancelled" };
}

export default function JobsPage() {
  const [tab, setTab] = useState<TabId>("in_progress");
  const [openJobId, setOpenJobId] = useState<string | null>(null);

  const counts = {
    upcoming: JOBS_ALL.filter((j) => j.status === "upcoming").length,
    in_progress: JOBS_ALL.filter((j) => j.status === "in_progress").length,
    awaiting_report: JOBS_ALL.filter((j) => j.status === "awaiting_report").length,
    completed: JOBS_ALL.filter((j) => j.status === "completed").length,
    cancelled: JOBS_ALL.filter((j) => j.status === "cancelled").length,
    recurring: RECURRING.length,
  };

  const listed = tab === "recurring" ? [] : JOBS_ALL.filter((j) => j.status === (tab as JobStatus));

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Jobs</h1>
          <p className="sub">
            Every job Fixfy manages — tracked end to end. Recurring tab = contract management (cleaning, security, maintenance).
          </p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">Export</button>
        </div>
      </div>

      <div className="ptabs">
        {TABS.map((tb) => (
          <div key={tb.id} className={`ptab${tab === tb.id ? " on" : ""}`} onClick={() => setTab(tb.id)}>
            {tb.l}
            <span
              className="ct"
              style={tb.id === "recurring" && tab === tb.id ? { background: "#7C3AED" } : undefined}
            >
              {counts[tb.id]}
            </span>
          </div>
        ))}
      </div>

      <div className="blk">
        {tab === "recurring" ? (
          <>
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--ln)",
                background: "linear-gradient(90deg,rgba(124,58,237,.04),transparent)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7C3AED" }} />
              <div style={{ flex: 1, fontSize: 12, color: "var(--s70)" }}>
                Recurring contracts — cleaning, security, regular maintenance. Agreed price, scheduled delivery,
                auto-invoiced.
              </div>
              <button className="btn btn-p btn-sm">+ New contract</button>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Site</th>
                  <th>Frequency</th>
                  <th>Service</th>
                  <th>Partner</th>
                  <th>Price</th>
                  <th>Next visit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECURRING.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="b">{r.name}</div>
                      <div className="mu mono">{r.id} · since {r.started}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.site}</td>
                    <td>
                      <span className="pill" style={{ background: "#F3E8FF", color: "#7C3AED" }}>{r.freq}</span>
                    </td>
                    <td><span className="pill n">{r.svc}</span></td>
                    <td style={{ fontSize: 12 }}>{r.partner}</td>
                    <td className="b mono">{r.price}</td>
                    <td className="mono mu">{r.nextVisit}</td>
                    <td><span className="pill ok"><span className="d" />Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <div className="tbar">
              <div className="srch">
                <span style={{ fontSize: 13, color: "var(--s50)" }}>⌕</span>
                <input placeholder="Search jobs…" />
              </div>
              <span className="fc on">All services ▾</span>
            </div>
            {listed.length === 0 ? (
              <div className="empty">
                <div className="ic-lg">✓</div>
                <div className="t">No {tab.replace("_", " ")} jobs</div>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Service</th>
                    <th>Site</th>
                    <th>Technician</th>
                    <th>Date</th>
                    <th>Value</th>
                    <th>SLA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listed.map((j) => {
                    const p = statusPill(j.status);
                    return (
                      <tr key={j.id} onClick={() => setOpenJobId(j.id)}>
                        <td>
                          <div className="b">{j.title}</div>
                          <div className="mu mono">{j.id}</div>
                        </td>
                        <td><span className="pill n">{j.svc}</span></td>
                        <td>
                          <div style={{ fontSize: 12 }}>{j.site}</div>
                          <div className="mu mono">{j.addr}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{j.tech}</td>
                        <td className="mono mu">{j.date}</td>
                        <td className="b mono">{j.value}</td>
                        <td>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: 11,
                              color:
                                j.slaPct < 50
                                  ? "var(--rd)"
                                  : j.slaPct < 75
                                  ? "var(--am)"
                                  : "var(--gr)",
                            }}
                          >
                            {j.sla}
                          </span>
                        </td>
                        <td>
                          <span className={`pill ${p.cls}`}>
                            <span className="d" />
                            {p.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      <JobDrawer jobId={openJobId} onClose={() => setOpenJobId(null)} />
    </div>
  );
}
