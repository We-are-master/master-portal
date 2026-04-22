"use client";

import { useState } from "react";
import { Icon } from "@/components/portal/icons";

const INVOICES = [
  { ref: "FX-INV-4421", job: "JOB-2468", site: "18 Crawford Street", issued: "22 Apr 26", due: "22 May 26", amount: "£280.00", status: "Unpaid", pill: "warn" },
  { ref: "FX-INV-4418", job: "JOB-2462", site: "42 Upper Street", issued: "21 Apr 26", due: "21 May 26", amount: "£165.00", status: "Paid", pill: "ok" },
  { ref: "FX-INV-4415", job: "JOB-2474", site: "28A Cromwell Road", issued: "21 Apr 26", due: "21 May 26", amount: "£180.00", status: "Unpaid", pill: "warn" },
  { ref: "FX-INV-4402", job: "JOB-2451", site: "Queen's Gate", issued: "15 Apr 26", due: "15 May 26", amount: "£1,240.00", status: "Paid", pill: "ok" },
  { ref: "FX-INV-4391", job: "JOB-2438", site: "14 Exmouth Market", issued: "08 Apr 26", due: "08 May 26", amount: "£3,420.00", status: "Paid", pill: "ok" },
  { ref: "FX-INV-4378", job: "JOB-2422", site: "Flat 4, Marylebone Lane", issued: "28 Mar 26", due: "28 Apr 26", amount: "£540.00", status: "Overdue", pill: "red" },
  { ref: "FX-INV-4365", job: "JOB-2411", site: "9 Pelham Place", issued: "18 Mar 26", due: "18 Apr 26", amount: "£890.00", status: "Paid", pill: "ok" },
];

export default function InvoicesPage() {
  const [filter, setFilter] = useState("all");
  const list = filter === "all" ? INVOICES : INVOICES.filter((i) => i.status.toLowerCase() === filter);

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Records</div>
          <h1>Invoices</h1>
          <p className="sub">Every invoice issued by Fixfy operators — linked to its job and site. Download statements or export for accounting.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Statement</button>
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Bulk download</button>
          <button className="btn btn-primary btn-sm">Export to Xero</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Total MTD</span><div className="value" style={{ fontSize: 24 }}>£6,715</div><div className="trend up">↑ 8%</div></div>
        <div className="kpi"><span className="label">Unpaid</span><div className="value" style={{ fontSize: 24 }}>£460</div><div className="trend flat">2 invoices</div></div>
        <div className="kpi"><span className="label">Overdue</span><div className="value coral" style={{ fontSize: 24 }}>£540</div><div className="trend flat">1 invoice</div></div>
        <div className="kpi"><span className="label">Paid YTD</span><div className="value" style={{ fontSize: 24 }}>£58,140</div><div className="trend up">↑ 14%</div></div>
      </div>

      <div className="block mt-20">
        <div className="tbl-toolbar">
          <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search by ref, job, site…" /></div>
          {[
            { id: "all", l: "All", c: INVOICES.length },
            { id: "unpaid", l: "Unpaid", c: 2 },
            { id: "overdue", l: "Overdue", c: 1 },
            { id: "paid", l: "Paid", c: 4 },
          ].map((f) => (
            <span key={f.id} className={`filter-chip${filter === f.id ? " active" : ""}`} onClick={() => setFilter(f.id)}>{f.l} <span className="v">{f.c}</span></span>
          ))}
          <span className="filter-chip">Date <Icon name="down" size={10} /></span>
          <span className="filter-chip">Site <Icon name="down" size={10} /></span>
        </div>
        <table className="tbl">
          <thead><tr><th>Reference</th><th>Job</th><th>Site</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((inv) => (
              <tr key={inv.ref} style={{ cursor: "pointer" }}>
                <td className="mono bold">{inv.ref}</td>
                <td className="mono text-xs" style={{ color: "var(--coral-600)" }}>{inv.job}</td>
                <td style={{ fontSize: 12 }}>{inv.site}</td>
                <td className="mono text-xs">{inv.issued}</td>
                <td className="mono text-xs">{inv.due}</td>
                <td className="bold mono">{inv.amount}</td>
                <td><span className={`pill ${inv.pill}`}><span className="d" />{inv.status}</span></td>
                <td style={{ color: "var(--slate-70)" }}><Icon name="download" size={13} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
