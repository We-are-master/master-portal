"use client";

import { useState } from "react";

type Tab = "notifications" | "integrations" | "users" | "compliance" | "account";

const TABS: { id: Tab; l: string }[] = [
  { id: "notifications", l: "Notifications" },
  { id: "integrations", l: "Integrations" },
  { id: "users", l: "Users & Access" },
  { id: "compliance", l: "Compliance Automation" },
  { id: "account", l: "Account Details" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("notifications");

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Settings</h1>
          <p className="sub">Control notifications, integrations, users and compliance automation for your account.</p>
        </div>
      </div>

      <div className="sg">
        <nav className="snav">
          {TABS.map((t) => (
            <a key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
              {t.l}
            </a>
          ))}
        </nav>
        <div>
          {tab === "notifications" && <NotificationsTab />}
          {tab === "integrations" && <IntegrationsTab />}
          {tab === "users" && <UsersTab />}
          {tab === "compliance" && <ComplianceTab />}
          {tab === "account" && <AccountTab />}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultOn = false,
}: {
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--ln)",
        gap: 20,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--s50)", marginTop: 2 }}>{desc}</div>
      </div>
      <div className={`tog${on ? " on" : ""}`} onClick={() => setOn((v) => !v)} />
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="sb2">
      <h4>Delivery channels</h4>
      <div className="sd">How do you want to hear from us?</div>
      <ToggleRow label="Email" desc="Quotes, SLA alerts, invoices, weekly digest" defaultOn />
      <ToggleRow label="SMS" desc="Urgent SLA breaches + P1 escalations" />
      <ToggleRow label="Push" desc="Real-time via mobile app (when available)" />
      <ToggleRow label="Weekly digest" desc="Summary every Monday 08:00" defaultOn />
    </div>
  );
}

function IntegrationsTab() {
  const rows = [
    { n: "Xero", d: "Sync invoices + payments to Xero" },
    { n: "QuickBooks", d: "Export invoices + mark paid" },
    { n: "Sage", d: "Accounting integration" },
    { n: "Zapier", d: "Trigger workflows on events" },
    { n: "Webhooks", d: "Subscribe to job + invoice events" },
    { n: "REST API", d: "Programmatic access to your data" },
  ];
  return (
    <div className="sb2">
      <h4>Integrations</h4>
      <div className="sd">Connect Fixfy to your accounting and workflow stack.</div>
      {rows.map((r) => (
        <div
          key={r.n}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: "1px solid var(--ln)",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{r.n}</div>
            <div style={{ fontSize: 11, color: "var(--s50)" }}>{r.d}</div>
          </div>
          <button className="btn btn-g btn-sm">Connect</button>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const users = [
    { name: "Guilherme Dantas", email: "guilherme@wearemaster.com", role: "Admin", status: "Active" },
    { name: "Rachel Okonkwo", email: "rachel@getfixfy.com", role: "Account Manager", status: "Active" },
    { name: "Marcus Reid", email: "marcus@getfixfy.com", role: "Viewer", status: "Pending" },
  ];
  return (
    <div className="sb2">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h4>Users & Access</h4>
          <div className="sd">Manage who can log in and what they can do.</div>
        </div>
        <button className="btn btn-p btn-sm">+ Invite user</button>
      </div>
      <table className="tbl" style={{ marginTop: 6 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email}>
              <td className="b">{u.name}</td>
              <td style={{ fontSize: 12 }}>{u.email}</td>
              <td><span className="pill n">{u.role}</span></td>
              <td>
                <span className={`pill ${u.status === "Active" ? "ok" : "w"}`}>
                  <span className="d" />
                  {u.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComplianceTab() {
  const rules = [
    { cert: "Gas Safe", days: 30 },
    { cert: "EICR", days: 60 },
    { cert: "EPC", days: 90 },
    { cert: "PAT Testing", days: 45 },
    { cert: "Fire Safety", days: 45 },
    { cert: "Legionella", days: 30 },
  ];
  return (
    <div className="sb2">
      <h4>Compliance automation</h4>
      <div className="sd">Automatically raise a job when a certificate nears expiry.</div>
      {rules.map((r) => (
        <div
          key={r.cert}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid var(--ln)",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{r.cert}</div>
            <div style={{ fontSize: 11, color: "var(--s50)" }}>
              Create a renewal job {r.days} days before expiry
            </div>
          </div>
          <div className="f" style={{ margin: 0, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <input type="number" defaultValue={r.days} style={{ width: 70, textAlign: "right" }} />
            <span style={{ fontSize: 11, color: "var(--s50)" }}>days</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountTab() {
  return (
    <div className="sb2">
      <h4>Account details</h4>
      <div className="sd">Company-level information used on invoices and reports.</div>
      <div className="fr">
        <div className="f">
          <label>Company name</label>
          <input defaultValue="Hollister & Wren" />
        </div>
        <div className="f">
          <label>Account type</label>
          <input defaultValue="Real Estate" disabled />
        </div>
      </div>
      <div className="fr">
        <div className="f">
          <label>Admin email</label>
          <input defaultValue="admin@hollister-wren.co.uk" />
        </div>
        <div className="f">
          <label>Phone</label>
          <input defaultValue="+44 20 7946 0001" />
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-g btn-sm">Cancel</button>
        <button className="btn btn-p btn-sm">Save changes</button>
      </div>
    </div>
  );
}
