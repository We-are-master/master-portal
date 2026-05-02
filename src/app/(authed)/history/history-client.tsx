"use client";

import { useState } from "react";
import type { PortalJobRow } from "@/lib/server-fetchers/portal-jobs";
import type { PortalQuoteRow } from "@/lib/server-fetchers/portal-quotes";

type Tab = "jobs" | "quotes";

interface Props {
  jobs:   PortalJobRow[];
  quotes: PortalQuoteRow[];
}

const JOB_PILL: Record<string, { l: string; cls: string }> = {
  completed: { l: "Completed", cls: "ok" },
  invoiced:  { l: "Invoiced",  cls: "ok" },
  cancelled: { l: "Cancelled", cls: "r" },
  no_action: { l: "No action", cls: "r" },
  closed:    { l: "Closed",    cls: "r" },
};

const QUOTE_PILL: Record<string, { l: string; cls: string }> = {
  accepted:         { l: "Accepted",         cls: "ok" },
  rejected:         { l: "Declined",         cls: "r" },
  converted_to_job: { l: "Converted to job", cls: "ok" },
};

function formatGBP(n: number): string {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 });
}

export function HistoryClient({ jobs, quotes }: Props) {
  const [tab, setTab] = useState<Tab>("jobs");

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>History</h1>
          <p className="sub">Everything Fixfy delivered — jobs and quotes. Searchable, filterable, exportable.</p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">Export</button>
        </div>
      </div>

      <div className="ptabs">
        {(
          [
            ["jobs",   "Jobs",   jobs.length],
            ["quotes", "Quotes", quotes.length],
          ] as [Tab, string, number][]
        ).map(([id, l, c]) => (
          <div key={id} className={`ptab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
            {l} <span className="ct">{c}</span>
          </div>
        ))}
      </div>

      <div className="blk">
        <div className="tbar">
          <div className="srch">
            <span style={{ fontSize: 13, color: "var(--s50)" }}>⌕</span>
            <input placeholder="Search…" />
          </div>
        </div>

        {tab === "jobs" && (
          jobs.length === 0 ? (
            <div className="empty"><div className="ic-lg">·</div><div className="t">No completed jobs yet</div></div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Site</th>
                  <th>Date</th>
                  <th>Partner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const p = JOB_PILL[j.status] ?? { l: j.status, cls: "n" };
                  const date = j.scheduled_date ?? j.scheduled_start_at ?? j.created_at;
                  return (
                    <tr key={j.id}>
                      <td>
                        <div className="b">{j.title}</div>
                        <div className="mu mono">{j.reference}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{j.property_address ?? "—"}</td>
                      <td className="mono mu">
                        {date ? new Date(date).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td style={{ fontSize: 12 }}>{j.partner_name ?? "—"}</td>
                      <td><span className={`pill ${p.cls}`}><span className="d" />{p.l}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {tab === "quotes" && (
          quotes.length === 0 ? (
            <div className="empty"><div className="ic-lg">·</div><div className="t">No quotes in history</div></div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Quote</th>
                  <th>Site</th>
                  <th>Submitted</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const p = QUOTE_PILL[q.status] ?? { l: q.status, cls: "n" };
                  return (
                    <tr key={q.id}>
                      <td>
                        <div className="b">{q.title}</div>
                        <div className="mu mono">{q.reference}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{q.property_address ?? "—"}</td>
                      <td className="mono mu">{new Date(q.created_at).toLocaleDateString("en-GB")}</td>
                      <td className="b mono">{formatGBP(Number(q.total_value ?? 0))}</td>
                      <td><span className={`pill ${p.cls}`}><span className="d" />{p.l}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
