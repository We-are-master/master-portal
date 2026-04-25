"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PortalInvoiceRow } from "@/lib/server-fetchers/portal-invoices";

type Filter = "all" | "outstanding" | "paid" | "overdue";

interface Props {
  outstanding: PortalInvoiceRow[];
  paid:        PortalInvoiceRow[];
}

const STATUS_PILL: Record<string, { l: string; cls: string }> = {
  pending:        { l: "Unpaid",        cls: "w" },
  partially_paid: { l: "Partial",       cls: "w" },
  overdue:        { l: "Overdue",       cls: "r" },
  paid:           { l: "Paid",          cls: "ok" },
};

function formatGBP(n: number): string {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });
}

export function InvoicesClient({ outstanding, paid }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const all = useMemo(() => [...outstanding, ...paid], [outstanding, paid]);
  const overdueRows = useMemo(() => outstanding.filter((i) => i.status === "overdue"), [outstanding]);

  const listed = useMemo(() => {
    if (filter === "all") return all;
    if (filter === "outstanding") return outstanding;
    if (filter === "paid") return paid;
    return overdueRows;
  }, [filter, all, outstanding, paid, overdueRows]);

  const counts = {
    all:         all.length,
    outstanding: outstanding.length,
    paid:        paid.length,
    overdue:     overdueRows.length,
  };

  const totalOutstanding = outstanding.reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const totalOverdue     = overdueRows.reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const totalPaidYtd     = paid.reduce((s, i) => s + Number(i.amount_paid ?? i.amount ?? 0), 0);

  const KPIS = [
    { lbl: "Outstanding", val: formatGBP(totalOutstanding), sub: `${counts.outstanding} unpaid` },
    { lbl: "Overdue",     val: formatGBP(totalOverdue),     sub: `${counts.overdue} past due` },
    { lbl: "Paid (visible)", val: formatGBP(totalPaidYtd),  sub: `${counts.paid} invoices` },
    { lbl: "Total invoices", val: counts.all,                sub: "All time" },
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
          {(["all", "outstanding", "paid", "overdue"] as Filter[]).map((f) => (
            <span key={f} className={`fc${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ opacity: 0.7 }}> · {counts[f]}</span>
            </span>
          ))}
        </div>
        {listed.length === 0 ? (
          <div className="empty">
            <div className="ic-lg">·</div>
            <div className="t">No invoices in this view</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Job</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listed.map((inv) => {
                const s = STATUS_PILL[inv.status] ?? { l: inv.status, cls: "n" };
                return (
                  <tr key={inv.id}>
                    <td>
                      <div className="b mono">{inv.reference}</div>
                      {inv.client_name && <div className="mu">{inv.client_name}</div>}
                    </td>
                    <td className="mono mu">{inv.job_reference ?? "—"}</td>
                    <td className="mono mu">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="mono mu">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="b mono">{formatGBP(Number(inv.amount ?? 0))}</td>
                    <td><span className={`pill ${s.cls}`}><span className="d" />{s.l}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="btn btn-g btn-sm"
                        style={{ textDecoration: "none" }}
                      >
                        Open
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
