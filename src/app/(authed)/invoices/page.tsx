"use client";

import Link from "next/link";
import { useState } from "react";
import { INVOICES_ALL } from "@/lib/mocks/portal-v2";

type Filter = "all" | "Unpaid" | "Paid" | "Overdue";

export default function InvoicesPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: INVOICES_ALL.length,
    Unpaid: INVOICES_ALL.filter((i) => i.status === "Unpaid").length,
    Paid: INVOICES_ALL.filter((i) => i.status === "Paid").length,
    Overdue: INVOICES_ALL.filter((i) => i.status === "Overdue").length,
  };

  const listed = filter === "all" ? INVOICES_ALL : INVOICES_ALL.filter((i) => i.status === filter);

  const KPIS = [
    { lbl: "Unpaid", val: counts.Unpaid, sub: "Within terms" },
    { lbl: "Overdue", val: counts.Overdue, sub: "Past due date" },
    { lbl: "Paid MTD", val: "£1,405", sub: "This month" },
    { lbl: "Paid YTD", val: "£28,420", sub: "Year to date" },
  ];

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Invoices</h1>
          <p className="sub">Every invoice Fixfy issues — downloadable and integratable with your accounting stack.</p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">↓ Download all</button>
          <button className="btn btn-n btn-sm">Sync to Xero</button>
        </div>
      </div>

      <div className="kg">
        {KPIS.map((k) => (
          <div className="kpi" key={k.lbl}>
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}</div>
            <div className="tr flat">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="blk">
        <div className="tbar">
          <div className="srch">
            <span style={{ fontSize: 13, color: "var(--s50)" }}>⌕</span>
            <input placeholder="Search invoices…" />
          </div>
          {(["all", "Unpaid", "Paid", "Overdue"] as Filter[]).map((f) => (
            <span key={f} className={`fc${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f} <span style={{ opacity: 0.7 }}>· {counts[f]}</span>
            </span>
          ))}
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Job</th>
              <th>Site</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listed.map((inv) => (
              <tr key={inv.ref}>
                <td>
                  <div className="b mono">{inv.ref}</div>
                </td>
                <td className="mono mu">{inv.job}</td>
                <td style={{ fontSize: 12 }}>{inv.site}</td>
                <td className="mono mu">{inv.issued}</td>
                <td className="mono mu">{inv.due}</td>
                <td className="b mono">{inv.amount}</td>
                <td>
                  <span className={`pill ${inv.pill}`}>
                    <span className="d" />
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link
                    href={`/invoices/${inv.ref}`}
                    className="btn btn-g btn-sm"
                    style={{ textDecoration: "none" }}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
