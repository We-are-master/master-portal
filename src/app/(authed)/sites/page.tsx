"use client";

import { Icon } from "@/components/portal/icons";

const SITES = [
  { id: "SITE-204", code: "HW-MAR-204", name: "Flat 4, 52 Marylebone Lane", type: "Flat", region: "Central London", branch: "Marylebone", postcode: "W1U 2NH", jobs: 3, spend: "£12,840", rag: "a", tenant: "Ms. L. Fairburn", compliance: "Due 12 May" },
  { id: "SITE-187", code: "HW-KNS-187", name: "28A Cromwell Road", type: "Flat", region: "Kensington & Chelsea", branch: "Kensington", postcode: "SW7 2HR", jobs: 1, spend: "£3,410", rag: "g", tenant: "Mr. D. Okonkwo", compliance: "Up to date" },
  { id: "SITE-311", code: "HW-ISL-311", name: "Office, 14 Exmouth Market", type: "Office", region: "Islington", branch: "Islington", postcode: "EC1R 4QE", jobs: 5, spend: "£28,120", rag: "r", tenant: "Beacon Studios Ltd", compliance: "Overdue" },
  { id: "SITE-142", code: "HW-MAR-142", name: "Flat 2, 18 Crawford Street", type: "Flat", region: "Central London", branch: "Marylebone", postcode: "W1H 1BT", jobs: 0, spend: "£1,240", rag: "g", tenant: "Vacant", compliance: "Up to date" },
  { id: "SITE-298", code: "HW-KNS-298", name: "Ground Floor, 9 Pelham Place", type: "Flat", region: "Kensington & Chelsea", branch: "Kensington", postcode: "SW7 2NH", jobs: 2, spend: "£6,890", rag: "a", tenant: "Ms. R. Delacroix", compliance: "Due 28 Apr" },
  { id: "SITE-401", code: "HW-ISL-401", name: "Shopfront, 42 Upper Street", type: "Retail", region: "Islington", branch: "Islington", postcode: "N1 0PN", jobs: 2, spend: "£9,240", rag: "g", tenant: "Petit Loaf Ltd", compliance: "Up to date" },
  { id: "SITE-178", code: "HW-MAR-178", name: "Flat 6, 112 George Street", type: "Flat", region: "Central London", branch: "Marylebone", postcode: "W1H 5RH", jobs: 1, spend: "£4,120", rag: "g", tenant: "Mr. T. Abenov", compliance: "Up to date" },
  { id: "SITE-267", code: "HW-KNS-267", name: "Communal Areas, Queen's Gate", type: "Communal", region: "Kensington & Chelsea", branch: "Kensington", postcode: "SW7 5HW", jobs: 4, spend: "£18,440", rag: "a", tenant: "(Landlord managed)", compliance: "Due 04 May" },
];

export default function SitesPage() {
  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Portfolio</div>
          <h1>Properties</h1>
          <p className="sub">{SITES.length} properties across 3 branches. Click a row to see full history, spend, compliance, and active jobs.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Export</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Add property</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Total properties</span><div className="value">{SITES.length}</div><div className="trend flat">3 branches</div></div>
        <div className="kpi"><span className="label">Active jobs</span><div className="value">{SITES.reduce((s, x) => s + x.jobs, 0)}</div><div className="trend up">+2 this week</div></div>
        <div className="kpi"><span className="label">Spend MTD</span><div className="value" style={{ fontSize: 22 }}>£{SITES.reduce((s, x) => s + parseInt(x.spend.replace(/[£,]/g, "")), 0).toLocaleString()}</div><div className="trend up">↑ 8%</div></div>
        <div className="kpi"><span className="label">Compliance alerts</span><div className="value coral">3</div><div className="trend flat">Due within 30d</div></div>
      </div>

      <div className="block mt-20">
        <div className="tbl-toolbar">
          <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search by name, postcode, code…" /></div>
          <span className="filter-chip active">Branch <span className="v">All</span><Icon name="down" size={10} /></span>
          <span className="filter-chip">Type <span className="v">Any</span><Icon name="down" size={10} /></span>
          <span className="filter-chip">Compliance <Icon name="down" size={10} /></span>
        </div>
        <table className="tbl">
          <thead><tr><th>Property</th><th>Code</th><th>Type</th><th>Tenant</th><th>Branch</th><th>Active</th><th>Spend MTD</th><th>Compliance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {SITES.map((s) => (
              <tr key={s.id} style={{ cursor: "pointer" }}>
                <td><div className="bold">{s.name}</div><span className="sub mono">{s.postcode} · {s.region}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{s.code}</td>
                <td>{s.type}</td>
                <td style={{ fontSize: 12 }}>{s.tenant}</td>
                <td>{s.branch}</td>
                <td>{s.jobs > 0 ? <span className="bold">{s.jobs}</span> : <span className="muted">0</span>}</td>
                <td className="mono">{s.spend}</td>
                <td style={{ fontSize: 12 }}>{s.compliance}</td>
                <td><div className={`rag rag-${s.rag}`} /></td>
                <td style={{ color: "var(--slate-30)" }}><Icon name="arrow" size={12} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
