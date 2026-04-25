"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { PortalAccountSettings } from "@/lib/server-fetchers/portal-account";
import type {
  PortalAccountSettingsRow,
  PortalNotificationPref,
} from "@/lib/server-fetchers/portal-settings";

type Tab = "notifications" | "account" | "integrations" | "users" | "compliance";

const TABS: { id: Tab; l: string }[] = [
  { id: "notifications", l: "Notifications" },
  { id: "account",       l: "Account Details" },
  { id: "users",         l: "Users & Access" },
  { id: "compliance",    l: "Compliance Automation" },
  { id: "integrations",  l: "Integrations" },
];

const NOTIF_TYPES: Array<{ id: string; label: string; desc: string }> = [
  { id: "quote_submitted", label: "Quote submitted",   desc: "When a partner returns a quote" },
  { id: "compliance_due",  label: "Compliance due",    desc: "Cert about to expire" },
  { id: "job_overdue",     label: "Job overdue",       desc: "Job past its scheduled date" },
  { id: "invoice_issued",  label: "Invoice issued",    desc: "New invoice posted to the account" },
  { id: "weekly_digest",   label: "Weekly digest",     desc: "Summary every Monday 08:00" },
  { id: "sla_breach",      label: "SLA breach",        desc: "P1/P2 about to miss SLA" },
];

interface Props {
  account:  PortalAccountSettings | null;
  settings: PortalAccountSettingsRow | null;
  prefs:    PortalNotificationPref[];
}

export function SettingsClient({ account, settings, prefs }: Props) {
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
          {tab === "notifications" && <NotificationsTab initial={prefs} />}
          {tab === "account"       && <AccountTab account={account} settings={settings} />}
          {tab === "users"         && <PlaceholderTab title="Users & Access" />}
          {tab === "compliance"    && <PlaceholderTab title="Compliance Automation" />}
          {tab === "integrations"  && <PlaceholderTab title="Integrations" />}
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="sb2">
      <h4>{title}</h4>
      <div className="sd">This section ships in a future release.</div>
    </div>
  );
}

function NotificationsTab({ initial }: { initial: PortalNotificationPref[] }) {
  const channels = ["email", "push"] as const;
  const [pending, startTransition] = useTransition();

  const initialMap = new Map<string, boolean>();
  for (const p of initial) initialMap.set(`${p.notification_type}::${p.channel}`, p.enabled);
  const [state, setState] = useState<Map<string, boolean>>(initialMap);

  const get = (t: string, c: string): boolean => state.get(`${t}::${c}`) ?? true;

  const toggle = (t: string, c: string) => {
    const next = !get(t, c);
    setState((m) => {
      const copy = new Map(m);
      copy.set(`${t}::${c}`, next);
      return copy;
    });
    startTransition(async () => {
      try {
        const res = await fetch("/api/account/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ notification_type: t, channel: c, enabled: next, scope: "user" }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        setState((m) => {
          const copy = new Map(m);
          copy.set(`${t}::${c}`, !next);
          return copy;
        });
        toast.error("Couldn't save that preference. Try again?");
        console.error(err);
      }
    });
  };

  return (
    <div className="sb2">
      <h4>Notification preferences</h4>
      <div className="sd">Choose how and when Fixfy alerts you. Toggles save instantly.</div>
      <table className="tbl" style={{ marginTop: 6 }}>
        <thead>
          <tr>
            <th>Notification</th>
            {channels.map((c) => (
              <th key={c} style={{ textAlign: "center" }}>{c.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {NOTIF_TYPES.map((row) => (
            <tr key={row.id}>
              <td>
                <div className="b">{row.label}</div>
                <div className="mu">{row.desc}</div>
              </td>
              {channels.map((c) => (
                <td key={c} style={{ textAlign: "center" }}>
                  <div
                    className={`tog${get(row.id, c) ? " on" : ""}`}
                    onClick={() => toggle(row.id, c)}
                    style={{ cursor: pending ? "wait" : "pointer", display: "inline-block" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountTab({
  account,
  settings,
}: {
  account: PortalAccountSettings | null;
  settings: PortalAccountSettingsRow | null;
}) {
  const [pending, startTransition] = useTransition();
  const [legalName,    setLegalName]    = useState(settings?.legal_name ?? account?.company_name ?? "");
  const [vatPct,       setVatPct]       = useState(String(settings?.vat_percentage ?? 20));
  const [currency,     setCurrency]     = useState(settings?.currency ?? "GBP");
  const [paymentTerms, setPaymentTerms] = useState(String(settings?.default_payment_terms_days ?? 30));

  const save = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/account/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            legal_name:                 legalName,
            vat_percentage:             Number(vatPct),
            currency:                   currency,
            default_payment_terms_days: Number(paymentTerms),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        toast.success("Settings saved.");
      } catch (err) {
        toast.error("Couldn't save settings. Try again?");
        console.error(err);
      }
    });
  };

  if (!account) {
    return <div className="sb2"><h4>Account Details</h4><div className="sd">Account not found.</div></div>;
  }

  return (
    <div className="sb2">
      <h4>Account details</h4>
      <div className="sd">Company-level information used on invoices and reports.</div>
      <div className="fr">
        <div className="f">
          <label>Company name</label>
          <input value={account.company_name} disabled />
        </div>
        <div className="f">
          <label>Legal name</label>
          <input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
        </div>
      </div>
      <div className="fr">
        <div className="f">
          <label>Admin email</label>
          <input value={account.email} disabled />
        </div>
        <div className="f">
          <label>Phone</label>
          <input value={account.contact_number ?? ""} disabled />
        </div>
      </div>
      <div className="fr">
        <div className="f">
          <label>VAT %</label>
          <input
            type="number"
            value={vatPct}
            onChange={(e) => setVatPct(e.target.value)}
            min={0}
            max={100}
            step={0.5}
          />
        </div>
        <div className="f">
          <label>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="GBP">GBP · £</option>
            <option value="EUR">EUR · €</option>
            <option value="USD">USD · $</option>
          </select>
        </div>
      </div>
      <div className="fr">
        <div className="f">
          <label>Default payment terms (days)</label>
          <input
            type="number"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            min={0}
            max={120}
          />
        </div>
        <div></div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-p btn-sm" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
