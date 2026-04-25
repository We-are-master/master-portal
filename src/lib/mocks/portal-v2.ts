/**
 * Portal-v2 mock data — ported from portal-v2/data.jsx.
 *
 * Wired pages pull from Supabase via server-fetchers; this file powers
 * the rest of the UI until those fetchers exist. Replacing a mock with
 * a real fetcher should be a drop-in on the page that consumes it.
 */

export type JobStatus =
  | "upcoming"
  | "in_progress"
  | "awaiting_report"
  | "completed"
  | "cancelled";

export interface MockJob {
  id: string;
  title: string;
  svc: string;
  site: string;
  addr: string;
  status: JobStatus;
  sla: string;
  slaPct: number;
  tech: string;
  value: string;
  date: string;
  commercial: boolean;
}

export interface MockQuote {
  id: string;
  site: string;
  scope: string;
  svc: string;
  submitted: string;
  labour: string;
  materials: string;
  vat: string;
  total: string;
  status: "awaiting_price" | "received" | "approved" | "rejected";
  slaLeft: string;
  slaPct: number;
}

export interface MockInvoice {
  ref: string;
  job: string;
  site: string;
  issued: string;
  due: string;
  amount: string;
  status: "Unpaid" | "Paid" | "Overdue";
  pill: "w" | "ok" | "r";
}

export interface MockNotification {
  unread: boolean;
  lbl: string;
  body: string;
  time: string;
}

export interface MockProperty {
  id: string;
  name: string;
  type: string;
  addr: string;
  branch: string;
  jobs: number;
  compl: number;
  rag: "ok" | "w" | "r";
  commercial: boolean;
  img: {
    scene: "residential-flat" | "office-commercial" | "communal-building" | "retail-shop";
    palette: [string, string];
  };
  ppm: { id: string; name: string; freq: string; svc: string; next: string; status: string }[];
  certs: { n: string; exp: string; daysLeft: number; status: "ok" | "w" | "r" }[];
  docs: { n: string; type: string; tag: string; size: string; enc: boolean }[];
}

export interface MockRecurring {
  id: string;
  name: string;
  site: string;
  freq: string;
  svc: string;
  price: string;
  partner: string;
  nextVisit: string;
  status: string;
  started: string;
}

export const JOBS_ALL: MockJob[] = [
  { id: "JOB-2481", title: "Boiler pressure fault", svc: "Plumbing", site: "Flat 4, Marylebone Lane", addr: "W1U 2NH", status: "in_progress", sla: "02:14", slaPct: 68, tech: "Marcus R.", value: "£340", date: "Today 14:30", commercial: false },
  { id: "JOB-2479", title: "EICR inspection", svc: "Electrical", site: "14 Exmouth Market", addr: "EC1R 4QE", status: "upcoming", sla: "5d", slaPct: 90, tech: "Liam K.", value: "£485", date: "25 Apr", commercial: true },
  { id: "JOB-2476", title: "Double glazing replacement", svc: "Glazing", site: "9 Pelham Place", addr: "SW7 2NH", status: "upcoming", sla: "3d", slaPct: 86, tech: "James H.", value: "£620", date: "25 Apr", commercial: false },
  { id: "JOB-2474", title: "Blocked kitchen drain", svc: "Plumbing", site: "28A Cromwell Road", addr: "SW7 2HR", status: "awaiting_report", sla: "Done", slaPct: 100, tech: "Sarah K.", value: "£180", date: "21 Apr", commercial: false },
  { id: "JOB-2468", title: "Post-tenancy deep clean", svc: "Cleaning", site: "18 Crawford Street", addr: "W1H 1BT", status: "completed", sla: "Done", slaPct: 100, tech: "Team A", value: "£280", date: "17 Apr", commercial: false },
  { id: "JOB-2462", title: "Lock barrel seized", svc: "Locksmith", site: "42 Upper Street", addr: "N1 0PN", status: "completed", sla: "Done", slaPct: 100, tech: "CityKey", value: "£165", date: "20 Apr", commercial: true },
  { id: "JOB-2460", title: "Heating system flush", svc: "HVAC", site: "Camden HQ", addr: "NW1 8AB", status: "cancelled", sla: "—", slaPct: 0, tech: "—", value: "£340", date: "18 Apr", commercial: true },
];

export const QUOTES_ALL: MockQuote[] = [
  { id: "QTE-9002", site: "14 Exmouth Market", scope: "EICR 5-year inspection + certification", svc: "Electrical", submitted: "Today 13:04", labour: "£320", materials: "£60", vat: "£76", total: "£456", status: "awaiting_price", slaLeft: "6h 12m", slaPct: 72 },
  { id: "QTE-8997", site: "Flat 4, Marylebone Lane", scope: "Boiler pressure fault", svc: "Plumbing", submitted: "Today 11:04", labour: "£260", materials: "£80", vat: "£68", total: "£408", status: "received", slaLeft: "—", slaPct: 100 },
  { id: "QTE-8991", site: "Queen's Gate Communal", scope: "Stairwell lighting fault", svc: "Electrical", submitted: "22 Apr", labour: "£1440", materials: "£380", vat: "£364", total: "£2,184", status: "approved", slaLeft: "—", slaPct: 100 },
  { id: "QTE-8988", site: "Soho Studio", scope: "Annual boiler service", svc: "Heating", submitted: "19 Apr", labour: "£200", materials: "£30", vat: "£46", total: "£276", status: "rejected", slaLeft: "—", slaPct: 0 },
];

export const INVOICES_ALL: MockInvoice[] = [
  { ref: "FX-INV-4421", job: "JOB-2468", site: "18 Crawford Street", issued: "22 Apr", due: "22 May", amount: "£280", status: "Unpaid", pill: "w" },
  { ref: "FX-INV-4418", job: "JOB-2462", site: "42 Upper Street", issued: "21 Apr", due: "21 May", amount: "£165", status: "Paid", pill: "ok" },
  { ref: "FX-INV-4415", job: "JOB-2474", site: "28A Cromwell Road", issued: "21 Apr", due: "21 May", amount: "£180", status: "Unpaid", pill: "w" },
  { ref: "FX-INV-4402", job: "JOB-2451", site: "Queen's Gate", issued: "15 Apr", due: "15 May", amount: "£1,240", status: "Paid", pill: "ok" },
  { ref: "FX-INV-4378", job: "JOB-2422", site: "Marylebone Lane", issued: "28 Mar", due: "28 Apr", amount: "£540", status: "Overdue", pill: "r" },
];

export const NOTIFICATIONS_MOCK: MockNotification[] = [
  { unread: true, lbl: "SLA BREACH", body: "JOB-2481 SLA expires in 2h 14m — boiler fault at Marylebone Lane", time: "Just now" },
  { unread: true, lbl: "QUOTE RECEIVED", body: "£456 quote received for EICR at 14 Exmouth Market — awaiting your approval", time: "18 min ago" },
  { unread: true, lbl: "COMPLIANCE", body: "Gas Safe cert at Flat 4 expires in 21 days — renew to stay compliant", time: "2h ago" },
  { unread: false, lbl: "JOB COMPLETE", body: "JOB-2474 completed by Sarah K. — report submitted and signed off", time: "Yesterday" },
  { unread: false, lbl: "INVOICE", body: "FX-INV-4421 issued for £280 — due 22 May", time: "Yesterday" },
];

export const PROPERTIES: MockProperty[] = [
  {
    id: "P-001", name: "Flat 4, 52 Marylebone Lane", type: "Flat", addr: "W1U 2NH",
    branch: "Marylebone", jobs: 3, compl: 88, rag: "w", commercial: false,
    img: { scene: "residential-flat", palette: ["#A8B8D0", "#8598B8"] },
    ppm: [
      { id: "PPM-1", name: "Annual Boiler Service", freq: "Yearly", svc: "Boiler", next: "12 May 2026", status: "active" },
      { id: "PPM-2", name: "Gas Safety Check", freq: "Yearly", svc: "Compliance", next: "14 May 2026", status: "active" },
    ],
    certs: [
      { n: "Gas Safe", exp: "14 May 2026", daysLeft: 21, status: "w" },
      { n: "EICR", exp: "08 Feb 2027", daysLeft: 291, status: "ok" },
      { n: "EPC", exp: "12 Sep 2028", daysLeft: 870, status: "ok" },
    ],
    docs: [
      { n: "Tenancy agreement 2025-2026.pdf", type: "pdf", tag: "tenancy", size: "2.4 MB", enc: true },
      { n: "Gas Safe certificate.pdf", type: "pdf", tag: "compliance", size: "420 KB", enc: true },
      { n: "Inventory check-in 14 Mar.pdf", type: "pdf", tag: "tenancy", size: "8.1 MB", enc: true },
    ],
  },
  {
    id: "P-002", name: "14 Exmouth Market", type: "Office", addr: "EC1R 4QE",
    branch: "Islington", jobs: 2, compl: 64, rag: "r", commercial: true,
    img: { scene: "office-commercial", palette: ["#8CA0B8", "#6B7F9A"] },
    ppm: [
      { id: "PPM-3", name: "Weekly Cleaning", freq: "Weekly", svc: "Cleaning", next: "25 Apr 2026", status: "active" },
      { id: "PPM-4", name: "HVAC Filter Change", freq: "Quarterly", svc: "HVAC", next: "01 Jun 2026", status: "active" },
    ],
    certs: [
      { n: "EICR", exp: "14 May 2026", daysLeft: 21, status: "r" },
      { n: "PAT Testing", exp: "28 Jun 2026", daysLeft: 66, status: "w" },
      { n: "Fire Safety", exp: "08 Sep 2026", daysLeft: 138, status: "ok" },
    ],
    docs: [
      { n: "Commercial lease 2023-2028.pdf", type: "pdf", tag: "lease", size: "3.8 MB", enc: true },
      { n: "EICR report 2021.pdf", type: "pdf", tag: "compliance", size: "1.2 MB", enc: true },
    ],
  },
  {
    id: "P-003", name: "28A Cromwell Road", type: "Flat", addr: "SW7 2HR",
    branch: "Kensington", jobs: 0, compl: 96, rag: "ok", commercial: false,
    img: { scene: "residential-flat", palette: ["#B8C8D8", "#98ACC8"] },
    ppm: [
      { id: "PPM-5", name: "Annual Boiler Service", freq: "Yearly", svc: "Boiler", next: "18 Sep 2026", status: "active" },
    ],
    certs: [
      { n: "Gas Safe", exp: "18 Sep 2026", daysLeft: 148, status: "ok" },
      { n: "EICR", exp: "22 Nov 2028", daysLeft: 940, status: "ok" },
    ],
    docs: [{ n: "Tenancy agreement.pdf", type: "pdf", tag: "tenancy", size: "1.9 MB", enc: true }],
  },
  {
    id: "P-004", name: "Queen's Gate Communal", type: "Communal", addr: "SW7 5HW",
    branch: "Kensington", jobs: 4, compl: 72, rag: "w", commercial: false,
    img: { scene: "communal-building", palette: ["#9AAEC8", "#7590B8"] },
    ppm: [
      { id: "PPM-6", name: "Stairwell Lighting PPM", freq: "Quarterly", svc: "Electrical", next: "01 May 2026", status: "active" },
      { id: "PPM-7", name: "Communal Cleaning", freq: "Weekly", svc: "Cleaning", next: "25 Apr 2026", status: "active" },
    ],
    certs: [
      { n: "Fire Safety", exp: "22 Apr 2027", daysLeft: 365, status: "ok" },
      { n: "Legionella", exp: "08 Jan 2027", daysLeft: 261, status: "ok" },
    ],
    docs: [{ n: "Block management agreement.pdf", type: "pdf", tag: "lease", size: "4.1 MB", enc: true }],
  },
  {
    id: "P-005", name: "42 Upper Street", type: "Retail", addr: "N1 0PN",
    branch: "Islington", jobs: 1, compl: 100, rag: "ok", commercial: true,
    img: { scene: "retail-shop", palette: ["#C8B8A0", "#A89880"] },
    ppm: [
      { id: "PPM-8", name: "Quarterly Deep Clean", freq: "Quarterly", svc: "Cleaning", next: "15 Jul 2026", status: "active" },
    ],
    certs: [
      { n: "PAT Testing", exp: "11 Jun 2027", daysLeft: 415, status: "ok" },
      { n: "Fire Safety", exp: "08 Sep 2026", daysLeft: 138, status: "ok" },
    ],
    docs: [{ n: "Commercial lease.pdf", type: "pdf", tag: "lease", size: "2.8 MB", enc: true }],
  },
];

export const RECURRING: MockRecurring[] = [
  { id: "REC-101", name: "Weekly Office Cleaning", site: "14 Exmouth Market", freq: "Weekly · Mon 06:00", svc: "Cleaning", price: "£180 / visit", partner: "CrystalClean Ltd", nextVisit: "Mon 28 Apr", status: "active", started: "14 Jan 2025" },
  { id: "REC-102", name: "Communal Stairwell Cleaning", site: "Queen's Gate Communal", freq: "Weekly · Fri", svc: "Cleaning", price: "£120 / visit", partner: "CrystalClean Ltd", nextVisit: "Fri 25 Apr", status: "active", started: "02 Jun 2025" },
  { id: "REC-103", name: "Night Security Patrol", site: "All commercial sites", freq: "Daily · 22:00–06:00", svc: "Security", price: "£840 / week", partner: "NightGuard Ltd", nextVisit: "Tonight 22:00", status: "active", started: "12 Oct 2024" },
  { id: "REC-104", name: "Monthly Gutter Clearance", site: "All residential sites", freq: "Monthly · 1st", svc: "Maintenance", price: "£65 / visit", partner: "GutterPro", nextVisit: "Fri 01 May", status: "active", started: "03 Mar 2024" },
];

export const SERVICE_LINES = [
  { id: "general", n: "General Maintenance", d: "Repairs, handyman, reactive" },
  { id: "electrical", n: "Electrical", d: "Installs, EICR, faults" },
  { id: "plumbing", n: "Plumbing", d: "Leaks, drains, installs" },
  { id: "compliance", n: "Compliance", d: "EICR, PAT, Gas Safe" },
  { id: "boiler", n: "Boiler Services", d: "Install, service, repair" },
  { id: "cleaning", n: "Cleaning", d: "EOT, deep, after-builders" },
  { id: "painting", n: "Painting / Decorating", d: "Interior, exterior" },
  { id: "builders", n: "Builders", d: "Structural, carpentry" },
  { id: "removals", n: "Removals", d: "Domestic, commercial" },
  { id: "dilaps", n: "Dilapidations", d: "End-of-lease reinstatement" },
  { id: "ppm", n: "PPM (Maintenance Plans)", d: "Recurring compliance & servicing", highlight: true },
] as const;
