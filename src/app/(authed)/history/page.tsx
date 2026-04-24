"use client";

import { useState } from "react";
import { JOBS_ALL, QUOTES_ALL } from "@/lib/mocks/portal-v2";

type Tab = "jobs" | "quotes" | "reports";

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>("jobs");

  const doneJobs = JOBS_ALL.filter((j) => j.status === "completed" || j.status === "cancelled");

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>History</h1>
          <p className="sub">Everything Fixfy delivered — jobs, quotes and reports. Searchable, filterable, exportable.</p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">Export</button>
        </div>
      </div>

      <div className="ptabs">
        {(
          [
            ["jobs", "Jobs", doneJobs.length],
            ["quotes", "Quotes", QUOTES_ALL.length],
            ["reports", "Reports", doneJobs.length],
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
          <span className="fc">Last 30d</span>
          <span className="fc">All services</span>
        </div>

        {tab === "jobs" && (
          <table className="tbl">
            <thead>
              <tr>
                <th>Job</th>
                <th>Service</th>
                <th>Site</th>
                <th>Date</th>
                <th>Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {doneJobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <div className="b">{j.title}</div>
                    <div className="mu mono">{j.id}</div>
                  </td>
                  <td><span className="pill n">{j.svc}</span></td>
                  <td style={{ fontSize: 12 }}>{j.site}</td>
                  <td className="mono mu">{j.date}</td>
                  <td className="b mono">{j.value}</td>
                  <td>
                    <span className={`pill ${j.status === "completed" ? "ok" : "r"}`}>
                      <span className="d" />
                      {j.status === "completed" ? "Done" : "Cancelled"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-g btn-sm">↓ PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "quotes" && (
          <table className="tbl">
            <thead>
              <tr>
                <th>Quote</th>
                <th>Service</th>
                <th>Site</th>
                <th>Submitted</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {QUOTES_ALL.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div className="b">{q.scope}</div>
                    <div className="mu mono">{q.id}</div>
                  </td>
                  <td><span className="pill n">{q.svc}</span></td>
                  <td style={{ fontSize: 12 }}>{q.site}</td>
                  <td className="mono mu">{q.submitted}</td>
                  <td className="b mono">{q.total}</td>
                  <td>
                    <span
                      className={`pill ${
                        q.status === "approved"
                          ? "ok"
                          : q.status === "awaiting_price"
                          ? "w"
                          : q.status === "received"
                          ? "c"
                          : "r"
                      }`}
                    >
                      <span className="d" />
                      {q.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "reports" && (
          <table className="tbl">
            <thead>
              <tr>
                <th>Report</th>
                <th>Job</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {doneJobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <div className="b">Completion report — {j.title}</div>
                    <div className="mu mono">{j.id}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{j.site}</td>
                  <td className="mono mu">{j.date}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-g btn-sm">↓ PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
