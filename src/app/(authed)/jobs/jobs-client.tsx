"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PortalJobRow } from "@/lib/server-fetchers/portal-jobs";

type Bucket = "active" | "scheduled" | "awaiting_report" | "completed" | "cancelled";

const BUCKETS: { id: Bucket; l: string; statuses: string[] }[] = [
  { id: "scheduled",       l: "Scheduled",       statuses: ["scheduled", "draft", "ready"] },
  { id: "active",          l: "In Progress",     statuses: ["in_progress_phase1", "in_progress_phase2", "in_progress_phase3"] },
  { id: "awaiting_report", l: "Awaiting Report", statuses: ["final_check", "awaiting_payment"] },
  { id: "completed",       l: "Completed",       statuses: ["completed", "invoiced"] },
  { id: "cancelled",       l: "Cancelled",       statuses: ["cancelled", "no_action", "closed"] },
];

const STATUS_LABEL: Record<string, { l: string; cls: string }> = {
  scheduled:          { l: "Scheduled",        cls: "b" },
  draft:              { l: "Draft",            cls: "n" },
  ready:              { l: "Ready",            cls: "b" },
  in_progress_phase1: { l: "In progress",      cls: "c" },
  in_progress_phase2: { l: "In progress",      cls: "c" },
  in_progress_phase3: { l: "In progress",      cls: "c" },
  final_check:        { l: "Awaiting report",  cls: "w" },
  awaiting_payment:   { l: "Awaiting payment", cls: "w" },
  completed:          { l: "Completed",        cls: "ok" },
  invoiced:           { l: "Invoiced",         cls: "ok" },
  cancelled:          { l: "Cancelled",        cls: "r" },
  no_action:          { l: "No action",        cls: "r" },
  closed:             { l: "Closed",           cls: "r" },
};

export function JobsClient({ jobs }: { jobs: PortalJobRow[] }) {
  const [bucket, setBucket] = useState<Bucket>("active");

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { active: 0, scheduled: 0, awaiting_report: 0, completed: 0, cancelled: 0 };
    for (const j of jobs) {
      for (const b of BUCKETS) {
        if (b.statuses.includes(j.status)) {
          c[b.id]++;
          break;
        }
      }
    }
    return c;
  }, [jobs]);

  const listed = useMemo(() => {
    const def = BUCKETS.find((b) => b.id === bucket);
    if (!def) return [];
    return jobs.filter((j) => def.statuses.includes(j.status));
  }, [jobs, bucket]);

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Jobs</h1>
          <p className="sub">
            Every job Fixfy manages — tracked end to end. Click any row to see the full timeline + report.
          </p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">Export</button>
        </div>
      </div>

      <div className="ptabs">
        {BUCKETS.map((tb) => (
          <div key={tb.id} className={`ptab${bucket === tb.id ? " on" : ""}`} onClick={() => setBucket(tb.id)}>
            {tb.l}
            <span className="ct">{counts[tb.id]}</span>
          </div>
        ))}
      </div>

      <div className="blk">
        <div className="tbar">
          <div className="srch">
            <span style={{ fontSize: 13, color: "var(--s50)" }}>⌕</span>
            <input placeholder="Search jobs…" />
          </div>
        </div>
        {listed.length === 0 ? (
          <div className="empty">
            <div className="ic-lg">✓</div>
            <div className="t">No {BUCKETS.find((b) => b.id === bucket)?.l.toLowerCase()} jobs</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Job</th>
                <th>Site</th>
                <th>Partner</th>
                <th>Date</th>
                <th>Phase</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listed.map((j) => {
                const s = STATUS_LABEL[j.status] ?? { l: j.status.replace(/_/g, " "), cls: "n" };
                const date = j.scheduled_date ?? j.scheduled_start_at ?? j.created_at;
                return (
                  <tr key={j.id}>
                    <td>
                      <div className="b">{j.title}</div>
                      <div className="mu mono">{j.reference}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{j.property_address ?? "—"}</td>
                    <td style={{ fontSize: 12 }}>{j.partner_name ?? "—"}</td>
                    <td className="mono mu">
                      {date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td className="mono mu">
                      {j.current_phase != null && j.total_phases ? `${j.current_phase}/${j.total_phases}` : "—"}
                    </td>
                    <td>
                      <span className={`pill ${s.cls}`}><span className="d" />{s.l}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/jobs/${j.id}`}
                        className="btn btn-g btn-sm"
                        style={{ textDecoration: "none" }}
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
