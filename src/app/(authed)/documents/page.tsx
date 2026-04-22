"use client";

import { useState } from "react";
import { Icon } from "@/components/portal/icons";

const DOCS = [
  { name: "Completion Report — JOB-2474.pdf", type: "pdf", size: "842 KB", site: "28A Cromwell Road", cat: "Reports", uploaded: "21 Apr 26", by: "Sasha Patel" },
  { name: "Gas Safety Certificate CP12 — Q1 2026.pdf", type: "pdf", size: "1.2 MB", site: "Flat 4, Marylebone Lane", cat: "Compliance", uploaded: "12 Feb 26", by: "Finch Heating Co." },
  { name: "Before — Kitchen drain.jpg", type: "img", size: "3.4 MB", site: "28A Cromwell Road", cat: "Photos", uploaded: "21 Apr 26", by: "Sasha Patel" },
  { name: "After — Kitchen drain.jpg", type: "img", size: "3.1 MB", site: "28A Cromwell Road", cat: "Photos", uploaded: "21 Apr 26", by: "Sasha Patel" },
  { name: "Quote — EICR 14 Exmouth Market.pdf", type: "pdf", size: "224 KB", site: "14 Exmouth Market", cat: "Quotes", uploaded: "19 Apr 26", by: "Volt Compliance Ltd" },
  { name: "Tenancy Agreement — Flat 4.docx", type: "doc", size: "98 KB", site: "Flat 4, Marylebone Lane", cat: "Tenancy", uploaded: "02 Jan 26", by: "Oliver Hughes" },
  { name: "RAMS — Communal works Queen's Gate.pdf", type: "pdf", size: "645 KB", site: "Queen's Gate", cat: "Compliance", uploaded: "10 Apr 26", by: "Arc Electrical" },
  { name: "Invoice FX-INV-4421.pdf", type: "pdf", size: "112 KB", site: "18 Crawford Street", cat: "Invoices", uploaded: "22 Apr 26", by: "Fixfy" },
  { name: "Access instructions — Pelham Place.pdf", type: "pdf", size: "88 KB", site: "9 Pelham Place", cat: "Site info", uploaded: "14 Jan 26", by: "Ngozi Adebayo" },
  { name: "EPC — 18 Crawford Street.pdf", type: "pdf", size: "390 KB", site: "18 Crawford Street", cat: "Compliance", uploaded: "05 Aug 24", by: "Oliver Hughes" },
];

const CATS = ["All", "Reports", "Compliance", "Photos", "Quotes", "Invoices", "Tenancy", "Site info"];

export default function DocumentsPage() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? DOCS : DOCS.filter((d) => d.cat === cat);

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Records</div>
          <h1>Documents</h1>
          <p className="sub">Secure central library. Every report, certificate, photo and invoice — tagged by site and job, searchable by anyone with permission.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Bulk download</button>
          <button className="btn btn-primary"><Icon name="upload" size={13} /> Upload</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Total files</span><div className="value">1,284</div><div className="trend up">+18 this week</div></div>
        <div className="kpi"><span className="label">Compliance docs</span><div className="value">124</div><div className="trend flat">All sites</div></div>
        <div className="kpi"><span className="label">Storage used</span><div className="value" style={{ fontSize: 22 }}>4.2 GB</div><div className="trend flat">of 50 GB</div></div>
        <div className="kpi"><span className="label">Expiring soon</span><div className="value coral">3</div><div className="trend flat">Certificates</div></div>
      </div>

      <div className="block mt-20">
        <div className="tbl-toolbar">
          <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search documents…" /></div>
          {CATS.map((c) => <span key={c} className={`filter-chip${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>{c}</span>)}
        </div>
        <div>
          {list.map((d, i) => (
            <div key={i} className="doc-item">
              <div className={`doc-ic ${d.type}`}>{d.type.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 500 }}>{d.name}</div>
                <div className="sub muted text-xs">{d.site} · {d.cat} · uploaded {d.uploaded} by {d.by}</div>
              </div>
              <div className="mono text-xs muted">{d.size}</div>
              <span className="pill slate">{d.cat}</span>
              <div style={{ color: "var(--slate-70)" }}><Icon name="download" size={14} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
