"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_TYPES, getAccountMeta, t as labelFor } from "@/lib/account-type";
import { NOTIFICATIONS_MOCK } from "@/lib/mocks/portal-v2";
import { OnboardingModal } from "./onboarding-modal";

interface PortalShellProps {
  accountName: string;
  accountType?: string;
  userEmail: string;
  userFullName: string | null;
  portalUserId: string;
  accountId: string;
  children: React.ReactNode;
}

type NavItem = { href: string; icon: string; label: string; count?: string; warn?: boolean };
type NavGroup = { group: string; items: NavItem[] };

function buildNav(): NavGroup[] {
  return [
    { group: "OVERVIEW", items: [
      { href: "/", icon: "▧", label: "Dashboard" },
      { href: "/live", icon: "◉", label: "Live View", count: "3", warn: true },
    ] },
    { group: "OPERATIONS", items: [
      { href: "/requests", icon: "£", label: "Requests", count: "2", warn: true },
      { href: "/jobs", icon: "⌘", label: "Jobs", count: "6" },
    ] },
    { group: "RECORDS", items: [
      { href: "/history", icon: "◩", label: "History" },
      { href: "/sites", icon: "◇", label: labelFor("sites") },
    ] },
    { group: "FINANCE", items: [
      { href: "/invoices", icon: "▭", label: "Invoices", count: "1", warn: true },
    ] },
    { group: "ADMIN", items: [
      { href: "/settings", icon: "△", label: "Settings" },
    ] },
  ];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/live": "Live View",
  "/requests": "Requests",
  "/jobs": "Jobs",
  "/history": "History",
  "/sites": "Properties",
  "/invoices": "Invoices",
  "/settings": "Settings",
  "/tickets": "Tickets",
};

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/jobs/")) return "Job detail";
  if (pathname.startsWith("/invoices/")) return "Invoice detail";
  if (pathname.startsWith("/tickets/")) return "Ticket";
  return TITLES[pathname] ?? "";
}

export function PortalShell({ accountName, children }: PortalShellProps) {
  const pathname = usePathname() ?? "/";
  const nav = buildNav();
  const meta = getAccountMeta();

  const [acctDropdown, setAcctDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const acctRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const unread = NOTIFICATIONS_MOCK.filter((n) => n.unread).length;
  const displayName = accountName || meta.type;

  return (
    <div className="app">
      <aside className="sb">
        <div className="sb-top">
          <div className="sb-brand">
            <span style={{ fontWeight: 600, letterSpacing: "-.02em", fontSize: 15 }}>Fixfy</span>
            <span className="v">Client OS</span>
          </div>
          <div className="acct-sw">
            <div className="acct-sw-lbl">Account</div>
            <div
              ref={acctRef}
              className="acct-sel"
              onClick={(e) => {
                e.stopPropagation();
                setAcctDropdown((v) => !v);
              }}
            >
              <div className="acct-ava" style={{ background: meta.accountColor }}>
                {meta.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="acct-name">{displayName}</div>
                <div className="acct-type">{meta.type}</div>
              </div>
              <span className="acct-caret">▾</span>
              {acctDropdown && (
                <div className="acct-dropdown">
                  {Object.entries(ACCOUNT_TYPES).map(([k, a]) => (
                    <div
                      key={k}
                      className={`acct-opt${meta.key === k ? " on" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAcctDropdown(false);
                      }}
                    >
                      <div className="ai" style={{ background: a.accountColor }}>
                        {a.initials}
                      </div>
                      <div>
                        <div className="an">{a.type}</div>
                        <div className="at">{a.shortTitle}</div>
                      </div>
                      {meta.key === k && (
                        <span style={{ marginLeft: "auto", color: "var(--co)", fontSize: 12 }}>✓</span>
                      )}
                    </div>
                  ))}
                  <div style={{ padding: "8px 12px", background: "var(--s10)", borderTop: "1px solid var(--ln)" }}>
                    <Link
                      href={`${pathname}?onboarding=1`}
                      onClick={() => setAcctDropdown(false)}
                      style={{ display: "block", padding: "5px 8px", fontSize: 11, color: "var(--co)", fontWeight: 500 }}
                    >
                      ↗ Preview all business types
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="sb-nav">
          {nav.map((grp) => (
            <div key={grp.group}>
              <div className="sbg">{grp.group}</div>
              {grp.items.map((it) => (
                <Link key={it.href} href={it.href} className={`si${isActive(pathname, it.href) ? " on" : ""}`}>
                  <span className="ic">{it.icon}</span>
                  <span>{it.label}</span>
                  {it.count && <span className={`ct${it.warn ? " w" : ""}`}>{it.count}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sb-foot">
          <Link href="/requests?priority=P1" className="sos-btn" style={{ textDecoration: "none" }}>
            <span className="sos-dot" />
            <span>Emergency · P1 request</span>
          </Link>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--mono)",
              color: "rgba(255,255,255,.28)",
              textAlign: "center",
              paddingTop: 4,
            }}
          >
            Fixfy OS · All systems operational
          </div>
        </div>
      </aside>

      <div className="main">
        <Topbar
          pathname={pathname}
          accountName={displayName}
          unread={unread}
          showNotif={showNotif}
          setShowNotif={setShowNotif}
          notifRef={notifRef}
        />
        <div className="scroll">{children}</div>
      </div>

      <Suspense fallback={null}>
        <OnboardingModal />
      </Suspense>
    </div>
  );
}

function Topbar({
  pathname,
  accountName,
  unread,
  showNotif,
  setShowNotif,
  notifRef,
}: {
  pathname: string;
  accountName: string;
  unread: number;
  showNotif: boolean;
  setShowNotif: (v: boolean) => void;
  notifRef: React.RefObject<HTMLDivElement | null>;
}) {
  const meta = getAccountMeta();
  const title = pageTitle(pathname);

  return (
    <header className="topbar">
      <div className="tb-title">
        {title}
        <Link
          href={`${pathname}?onboarding=1`}
          className="tb-preview-chip"
          title="Preview other business types"
          style={{ textDecoration: "none" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--co)" }} />
          {meta.type} preview · switch
        </Link>
      </div>
      <div style={{ flex: 1 }} />
      <div className="tb-ic" title="Help">?</div>
      <div
        ref={notifRef}
        className="tb-ic"
        style={{ position: "relative" }}
        onClick={(e) => {
          e.stopPropagation();
          setShowNotif(!showNotif);
        }}
      >
        🔔 {unread > 0 && <span className="tb-notif" />}
        {showNotif && (
          <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
            <div className="notif-hdr">
              <span>Notifications</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--co)", cursor: "pointer" }}>
                Mark all read
              </span>
            </div>
            {NOTIFICATIONS_MOCK.map((n, i) => (
              <div key={i} className={`nitem${n.unread ? " unread" : ""}`}>
                <div className="n-lbl">{n.lbl}</div>
                <div className="n-body">{n.body}</div>
                <div className="n-time">{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px 4px 5px",
          border: "1px solid var(--ln)",
          borderRadius: 20,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: meta.accountColor,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--mono)",
            fontSize: 10,
            fontWeight: 500,
          }}
        >
          {meta.initials}
        </div>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{accountName}</span>
      </div>
    </header>
  );
}

export default PortalShell;
