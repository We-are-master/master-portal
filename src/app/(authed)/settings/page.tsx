"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [tab, setTab] = useState("account");
  const [tog, setTog] = useState<Record<string, boolean>>({ email: true, mobile: true, digest: false, quote: true, compl: true, overdue: true, finance: false });

  const TABS = [
    { id: "account", l: "Account" },
    { id: "branding", l: "Branding" },
    { id: "notifications", l: "Notifications" },
    { id: "approvals", l: "Approval rules" },
    { id: "categories", l: "Categories & SLAs" },
    { id: "integrations", l: "Integrations" },
    { id: "billing", l: "Billing & plan" },
    { id: "security", l: "Security" },
  ];

  function Toggle({ k, n, d }: { k: string; n: string; d: string }) {
    return (
      <div className="toggle-row">
        <div><div className="n" style={{ fontSize: 13, fontWeight: 500 }}>{n}</div><div className="d" style={{ fontSize: 11, color: "var(--slate-50)", marginTop: 1 }}>{d}</div></div>
        <div className={`toggle${tog[k] ? " on" : ""}`} onClick={() => setTog({ ...tog, [k]: !tog[k] })} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <div className="kicker">Admin</div>
          <h1>Settings</h1>
          <p className="sub">Account, branding, notification preferences, integrations and billing — all in one place.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-nav">
          {TABS.map((s) => (
            <a key={s.id} className={tab === s.id ? "active" : ""} onClick={() => setTab(s.id)}>{s.l}</a>
          ))}
        </div>

        <div>
          {tab === "account" && (
            <div className="settings-block">
              <h4>Account</h4>
              <div className="sub">Company profile used across reports and communications.</div>
              <div className="grid-2">
                <div className="field"><label>Company name</label><input defaultValue="Hollister & Wren" /></div>
                <div className="field"><label>Account type</label><input defaultValue="Estate Agency" /></div>
                <div className="field"><label>Registered address</label><input defaultValue="42 Baker Street, London W1U 7DB" /></div>
                <div className="field"><label>Accounts email</label><input defaultValue="accounts@hollisterwren.co.uk" /></div>
                <div className="field"><label>Default VAT</label><input defaultValue="20%" /></div>
                <div className="field"><label>Currency</label><input defaultValue="GBP · £" /></div>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="settings-block">
              <h4>Notification preferences</h4>
              <div className="sub">Choose how and when Fixfy alerts you.</div>
              <Toggle k="email" n="Email alerts" d="Approvals, reports, invoices" />
              <Toggle k="mobile" n="Mobile push" d="Real-time job updates" />
              <Toggle k="digest" n="Weekly digest" d="Portfolio summary every Monday 08:00" />
              <Toggle k="quote" n="Quote submitted" d="New quote awaiting approval" />
              <Toggle k="compl" n="Compliance reminders" d="30/14/7 day expiry warnings" />
              <Toggle k="overdue" n="Overdue jobs" d="When a job breaches SLA" />
              <Toggle k="finance" n="Finance-only alerts" d="Invoices and statements only" />
            </div>
          )}

          {tab === "branding" && (
            <div className="settings-block">
              <h4>Branding</h4>
              <div className="sub">Logo and colours on client-facing reports and emails.</div>
              <div className="grid-2">
                <div className="field"><label>Logo</label><div className="upload" style={{ padding: 20 }}><div className="t">Upload PNG / SVG</div><div className="s" style={{ fontSize: 11, color: "var(--slate-50)", marginTop: 2 }}>Max 2MB</div></div></div>
                <div className="field"><label>Accent colour</label><input defaultValue="#1A3A8F" /></div>
              </div>
            </div>
          )}

          {tab === "integrations" && (
            <div className="settings-block">
              <h4>Integrations</h4>
              <div className="sub">Xero · QuickBooks · Sage · Slack · Microsoft Teams · Google Calendar</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 14 }}>
                {["Xero", "QuickBooks", "Sage", "Slack", "Teams", "Calendar"].map((n) => (
                  <div key={n} style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 5, textAlign: "center" }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{n}</div>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>Connect</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!["account", "notifications", "branding", "integrations"].includes(tab) && (
            <div className="settings-block">
              <h4>{TABS.find((t) => t.id === tab)?.l}</h4>
              <div className="sub">This section is being configured.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
