"use client";

import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, props: IconProps) {
  const { size: _, ...rest } = props;
  return { width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.4, ...rest };
}

export function IconDashboard(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><rect x="2" y="2" width="5" height="6" rx="1" /><rect x="9" y="2" width="5" height="4" rx="1" /><rect x="2" y="10" width="5" height="4" rx="1" /><rect x="9" y="8" width="5" height="6" rx="1" /></svg>; }
export function IconRequests(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M3 3h10v10H3z" /><path d="M6 6h4M6 8h4M6 10h3" /></svg>; }
export function IconJobs(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M2 5h12v8H2z" /><path d="M5 5V3h6v2" /><path d="M2 8h12" /></svg>; }
export function IconSites(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M8 14s5-4.5 5-8a5 5 0 10-10 0c0 3.5 5 8 5 8z" /><circle cx="8" cy="6" r="2" /></svg>; }
export function IconQuotes(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M3 2h7l3 3v9H3z" /><path d="M10 2v3h3" /><path d="M6 9l1.5 1.5L10 8" /></svg>; }
export function IconReports(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M2 13V3M13 13V7M7.5 13V5" /><path d="M1 14h14" /></svg>; }
export function IconInvoices(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M3 2h10v12l-2-1.5L9 14l-2-1.5L5 14l-2-1.5z" /><path d="M6 6h4M6 9h4" /></svg>; }
export function IconDocuments(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M4 2h5l3 3v9H4z" /><path d="M9 2v3h3" /></svg>; }
export function IconTeam(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><circle cx="6" cy="6" r="2.5" /><path d="M2 14c0-2 2-3.5 4-3.5s4 1.5 4 3.5" /><circle cx="11.5" cy="6.5" r="2" /><path d="M10 14c0-1.5 1.5-3 3-3s1 0 1 0" /></svg>; }
export function IconCompliance(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M8 1l6 2v5c0 3.5-2.5 6-6 7-3.5-1-6-3.5-6-7V3z" /><path d="M5.5 8l2 2 3-3.5" /></svg>; }
export function IconNotifications(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M8 2a4 4 0 00-4 4v3l-1.5 2h11L12 9V6a4 4 0 00-4-4z" /><path d="M6.5 13a1.5 1.5 0 003 0" /></svg>; }
export function IconSettings(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><circle cx="8" cy="8" r="2" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" /></svg>; }
export function IconSearch(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, { ...p, strokeWidth: 1.5 })}><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>; }
export function IconBell(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, { ...p, strokeWidth: 1.5 })}><path d="M8 2a4 4 0 00-4 4v3l-1.5 2h11L12 9V6a4 4 0 00-4-4z" /><path d="M6.5 13a1.5 1.5 0 003 0" /></svg>; }
export function IconHelp(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, { ...p, strokeWidth: 1.5 })}><circle cx="8" cy="8" r="6" /><path d="M6.5 6a1.5 1.5 0 113 0c0 1-1.5 1-1.5 2.5M8 11v.01" /></svg>; }
export function IconPlus(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, { ...p, strokeWidth: 1.5 })}><path d="M8 3v10M3 8h10" /></svg>; }
export function IconArrow(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, { ...p, strokeWidth: 1.5 })}><path d="M4 8h8M8 4l4 4-4 4" /></svg>; }
export function IconUp(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 12 12" {...base(s, { ...p, strokeWidth: 1.5 })}><path d="M2 7l4-4 4 4" /></svg>; }
export function IconDown(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 12 12" {...base(s, { ...p, strokeWidth: 1.5 })}><path d="M2 5l4 4 4-4" /></svg>; }
export function IconDots(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" width={s} height={s} fill="currentColor"><circle cx="3" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="13" cy="8" r="1.3" /></svg>; }
export function IconFilter(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M2 3h12l-4.5 5v5l-3 1V8z" /></svg>; }
export function IconDownload(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M8 2v8M5 7l3 3 3-3M3 13h10" /></svg>; }
export function IconUpload(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M8 11V3M5 6l3-3 3 3M3 13h10" /></svg>; }
export function IconCheck(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, { ...p, strokeWidth: 2 })}><path d="M3 8l3 3 7-7" /></svg>; }
export function IconClose(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, { ...p, strokeWidth: 1.5 })}><path d="M4 4l8 8M4 12l8-8" /></svg>; }
export function IconCalendar(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><rect x="2" y="3" width="12" height="11" rx="1" /><path d="M2 6h12M5 2v2M11 2v2" /></svg>; }
export function IconPin(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><path d="M8 14s5-4.5 5-8a5 5 0 10-10 0c0 3.5 5 8 5 8z" /><circle cx="8" cy="6" r="2" /></svg>; }
export function IconClock(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2 1.5" /></svg>; }
export function IconImage(p: IconProps) { const s = p.size ?? 14; return <svg viewBox="0 0 16 16" {...base(s, p)}><rect x="2" y="3" width="12" height="10" rx="1" /><circle cx="5.5" cy="6.5" r="1" /><path d="M2 11l3.5-3.5 3 3 2-2L14 11" /></svg>; }

/** Lookup map for dynamic icon rendering by name string */
export const ICON_MAP: Record<string, (p: IconProps) => React.JSX.Element> = {
  dashboard: IconDashboard,
  requests: IconRequests,
  jobs: IconJobs,
  sites: IconSites,
  quotes: IconQuotes,
  reports: IconReports,
  invoices: IconInvoices,
  documents: IconDocuments,
  team: IconTeam,
  compliance: IconCompliance,
  notifications: IconNotifications,
  settings: IconSettings,
  search: IconSearch,
  bell: IconBell,
  help: IconHelp,
  plus: IconPlus,
  arrow: IconArrow,
  up: IconUp,
  down: IconDown,
  dots: IconDots,
  filter: IconFilter,
  download: IconDownload,
  upload: IconUpload,
  check: IconCheck,
  close: IconClose,
  calendar: IconCalendar,
  pin: IconPin,
  clock: IconClock,
  image: IconImage,
};

export function Icon({ name, size = 14, ...rest }: IconProps & { name: string }) {
  const Comp = ICON_MAP[name];
  if (!Comp) return null;
  return <Comp size={size} {...rest} />;
}
