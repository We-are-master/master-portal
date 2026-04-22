"use client";

import { Icon } from "@/components/portal/icons";

const TEAM = [
  { name: "Priya Nair", email: "priya.nair@hollisterwren.co.uk", role: "Admin", scope: "All sites", branches: "All", status: "Active", color: "#020040", initials: "PN" },
  { name: "Oliver Hughes", email: "oliver.hughes@hollisterwren.co.uk", role: "Head Office Manager", scope: "All sites", branches: "All", status: "Active", color: "#EA4C0B", initials: "OH" },
  { name: "Ngozi Adebayo", email: "ngozi.a@hollisterwren.co.uk", role: "Branch Manager", scope: "42 properties", branches: "Marylebone", status: "Active", color: "#16A34A", initials: "NA" },
  { name: "Rhys Llewellyn", email: "rhys.l@hollisterwren.co.uk", role: "Branch Manager", scope: "18 properties", branches: "Kensington", status: "Active", color: "#2563EB", initials: "RL" },
  { name: "Elena Kovač", email: "elena.k@hollisterwren.co.uk", role: "Property Manager", scope: "9 properties", branches: "Islington", status: "Active", color: "#D97706", initials: "EK" },
  { name: "Mateus Ribeiro", email: "mateus.r@hollisterwren.co.uk", role: "Finance User", scope: "Invoices only", branches: "All", status: "Active", color: "#4A4A64", initials: "MR" },
  { name: "Sam Kelleher", email: "sam.k@hollisterwren.co.uk", role: "Read-Only", scope: "All sites", branches: "All", status: "Invited", color: "#7A7A90", initials: "SK" },
];

export default function TeamPage() {
  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Admin</div>
          <h1>Team &amp; Users</h1>
          <p className="sub">7 users across your account. Permissions scope to branches, sites and actions. Approval limits applied per role.</p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm">Roles &amp; permissions</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Invite user</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><span className="label">Active users</span><div className="value">6</div></div>
        <div className="kpi"><span className="label">Pending invites</span><div className="value">1</div></div>
        <div className="kpi"><span className="label">Roles</span><div className="value">6</div></div>
        <div className="kpi"><span className="label">Approvers</span><div className="value">3</div></div>
      </div>

      <div className="block mt-20">
        <div className="tbl-toolbar">
          <div className="tbl-search"><Icon name="search" size={13} /><input placeholder="Search users…" /></div>
          <span className="filter-chip active">All roles</span>
          <span className="filter-chip">Branch <Icon name="down" size={10} /></span>
        </div>
        <div>
          {TEAM.map((u, i) => (
            <div key={i} className="user-row">
              <div className="ava" style={{ width: 32, height: 32, borderRadius: "50%", background: u.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{u.initials}</div>
              <div><div style={{ fontWeight: 500 }}>{u.name}</div><div className="sub muted text-xs">{u.email}</div></div>
              <div><span className="pill navy">{u.role}</span><div className="sub muted text-xs" style={{ marginTop: 4 }}>{u.scope} · {u.branches}</div></div>
              <div><span className={`pill ${u.status === "Active" ? "ok" : "warn"}`}>{u.status}</span></div>
              <div style={{ color: "var(--slate-50)" }}><Icon name="dots" size={14} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="block mt-20">
        <div className="block-hdr"><div><h3>Approval rules</h3><div className="sub">Spend thresholds per role</div></div><button className="btn btn-ghost btn-sm">Edit rules</button></div>
        <table className="tbl">
          <thead><tr><th>Role</th><th>Scope</th><th>Auto-approve up to</th><th>Needs approval over</th><th>Can reject</th></tr></thead>
          <tbody>
            <tr><td className="bold">Branch Manager</td><td>Own branch only</td><td className="mono">£250.00</td><td>Head Office</td><td>Yes</td></tr>
            <tr><td className="bold">Property Manager</td><td>Assigned properties</td><td className="mono">£150.00</td><td>Branch Manager</td><td>No</td></tr>
            <tr><td className="bold">Head Office Manager</td><td>All sites</td><td className="mono">£2,000.00</td><td>Admin</td><td>Yes</td></tr>
            <tr><td className="bold">Admin</td><td>All sites</td><td className="mono">Unlimited</td><td>—</td><td>Yes</td></tr>
            <tr><td className="bold">Finance User</td><td>Invoices only</td><td className="mono">—</td><td>—</td><td>No</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
