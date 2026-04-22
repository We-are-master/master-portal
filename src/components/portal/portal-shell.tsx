"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { PortalNotificationBell } from "./portal-notification-bell";

interface PortalShellProps {
  accountName: string;
  accountType?: string;
  userEmail: string;
  userFullName: string | null;
  portalUserId: string;
  accountId: string;
  children: React.ReactNode;
}

const NAV = [
  {
    group: "OPERATIONS",
    items: [
      { href: "/", icon: "dashboard", label: "Dashboard" },
      { href: "/requests", icon: "requests", label: "Requests", count: "3" },
      { href: "/jobs", icon: "jobs", label: "Jobs", count: "9" },
      { href: "/quotes", icon: "quotes", label: "Quotes & Approvals", count: "2", warn: true },
    ],
  },
  {
    group: "PORTFOLIO",
    items: [
      { href: "/sites", icon: "sites", label: "Sites" },
      { href: "/compliance", icon: "compliance", label: "Compliance", count: "2", warn: true },
    ],
  },
  {
    group: "RECORDS",
    items: [
      { href: "/reports", icon: "reports", label: "Reports" },
      { href: "/invoices", icon: "invoices", label: "Invoices" },
      { href: "/documents", icon: "documents", label: "Documents" },
    ],
  },
  {
    group: "ADMIN",
    items: [
      { href: "/team", icon: "team", label: "Team & Users" },
      { href: "/notifications", icon: "notifications", label: "Notifications", count: "3", warn: true },
      { href: "/settings", icon: "settings", label: "Settings" },
    ],
  },
];

const BREADCRUMB_MAP: Record<string, [string, string]> = {
  "/": ["Operations", "Dashboard"],
  "/requests": ["Operations", "Requests"],
  "/jobs": ["Operations", "Jobs"],
  "/quotes": ["Operations", "Quotes & Approvals"],
  "/sites": ["Portfolio", "Sites"],
  "/compliance": ["Portfolio", "Compliance"],
  "/reports": ["Records", "Reports"],
  "/invoices": ["Records", "Invoices"],
  "/documents": ["Records", "Documents"],
  "/team": ["Admin", "Team & Users"],
  "/notifications": ["Admin", "Notifications"],
  "/settings": ["Admin", "Settings"],
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function PortalShell({
  accountName,
  accountType = "Business",
  userEmail,
  userFullName,
  portalUserId,
  accountId,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const [roleOpen, setRoleOpen] = useState(false);
  const initials = getInitials(userFullName, userEmail);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const crumbs = BREADCRUMB_MAP[pathname] ?? BREADCRUMB_MAP[
    Object.keys(BREADCRUMB_MAP).find((k) => k !== "/" && pathname.startsWith(k)) ?? "/"
  ] ?? ["—", "—"];

  return (
    <div className="app">
      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sb-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://wearemaster.com/favicon.png" alt="Fixfy" style={{ height: 22 }} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>fixfy</span>
          <span className="env">UK</span>
        </div>

        {/* Role / account switcher */}
        <div className="sb-role" style={{ position: "relative" }}>
          <button className="sb-role-btn" onClick={() => setRoleOpen(!roleOpen)} type="button">
            <div className="rs-avatar">{initials}</div>
            <div className="rs-meta">
              <div className="rs-name">{accountName || "Portal"}</div>
              <div className="rs-company">{accountType}</div>
            </div>
            <div className="rs-caret"><Icon name="down" size={10} /></div>
          </button>
          {roleOpen && (
            <div
              style={{
                position: "absolute", top: "100%", left: 14, right: 14,
                background: "#fff", border: "1px solid var(--line)", borderRadius: 6,
                zIndex: 10, boxShadow: "0 8px 32px rgba(2,0,64,0.18)", marginTop: 4, overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 14px", display: "flex", gap: 10, alignItems: "center",
                  borderBottom: "1px solid var(--line)", background: "var(--slate-10)",
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", background: "var(--navy)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, flexShrink: 0,
                }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{accountName}</div>
                  <div style={{ fontSize: 11, color: "var(--slate-50)" }}>{accountType}</div>
                </div>
                <div style={{ color: "var(--coral)" }}><Icon name="check" size={14} /></div>
              </div>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 12, color: "var(--red)",
                    textAlign: "left", cursor: "pointer", background: "none", border: "none",
                    fontFamily: "inherit",
                  }}
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="sb-search">
          <div className="ic"><Icon name="search" size={13} /></div>
          <input placeholder="Search jobs, sites, invoices…" />
          <span className="kbd">⌘K</span>
        </div>

        {/* Navigation */}
        <nav className="sb-nav">
          {NAV.map((grp) => (
            <div key={grp.group}>
              <div className="sb-group-lbl">{grp.group}</div>
              {grp.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`sb-item${isActive(it.href) ? " active" : ""}`}
                >
                  <div className="sb-ic"><Icon name={it.icon} size={14} /></div>
                  <span>{it.label}</span>
                  {it.count && (
                    <span className={`sb-count${it.warn ? " warn" : ""}`}>{it.count}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sb-bottom">
          <div className="dot" />
          <span>All systems operational</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--mono)" }}>v3.4.1</span>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div className="main">
        <header className="topbar">
          <div className="crumbs">
            <span>{accountName}</span>
            <span className="sep">/</span>
            <span>{crumbs[0]}</span>
            <span className="sep">/</span>
            <b>{crumbs[1]}</b>
          </div>
          <div className="spacer" />
          <button className="topbar-icon" type="button" title="Help">
            <Icon name="help" size={15} />
          </button>
          <PortalNotificationBell portalUserId={portalUserId} accountId={accountId} />
          <div className="topbar-user">
            <div className="ava">{initials}</div>
            <div>
              <div className="n">{userFullName || userEmail}</div>
              <div className="r">{accountType}</div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
