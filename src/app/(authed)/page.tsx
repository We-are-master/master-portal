"use client";

import { Icon } from "@/components/portal/icons";

/* ── Mock data (will be replaced with real Supabase fetchers) ─── */
const KPIS = [
  { label: "Open Requests", value: "14", trend: "up", trendTxt: "+3 this week" },
  { label: "Jobs in Progress", value: "9", trend: "flat", trendTxt: "Stable" },
  { label: "Quotes Awaiting", value: "2", trend: "up", trendTxt: "Action needed", coral: true },
  { label: "Overdue Jobs", value: "1", trend: "down", trendTxt: "↓ from 3" },
  { label: "Spend This Month", value: "£28,420", trend: "up", trendTxt: "↑ 8% vs Mar" },
  { label: "Emergency Jobs", value: "3", trend: "flat", trendTxt: "This month" },
  { label: "Completed", value: "41", trend: "up", trendTxt: "↑ 12% MoM" },
  { label: "Avg. Completion", value: "3.2d", trend: "up", trendTxt: "↑ faster" },
];

const FEED = [
  { t: "3 min ago", dot: "coral", ic: "●", body: "Engineer Marcus R. arrived on site at Flat 4, 52 Marylebone Lane for JOB-2481" },
  { t: "28 min ago", dot: "amber", ic: "£", body: "Quote submitted: £485.00 for EICR inspection at 14 Exmouth Market — awaiting your approval" },
  { t: "1h 12m ago", dot: "green", ic: "✓", body: "Completion report uploaded for JOB-2474 · Blocked kitchen drain (28A Cromwell Road)" },
  { t: "2h ago", dot: "blue", ic: "@", body: "Sasha Patel sent an update on JOB-2459: \"Booked for Friday morning, will call ahead\"" },
  { t: "Today · 09:02", dot: "coral", ic: "£", body: "Invoice FX-INV-4421 issued — £280.00 for Post-tenancy deep clean (18 Crawford Street)" },
  { t: "Yesterday · 17:20", dot: "green", ic: "✓", body: "Job JOB-2474 completed · 2h 06m on site · photos attached" },
  { t: "Yesterday · 16:40", dot: "green", ic: "✓", body: "Quote approved by Priya Nair: £620.00 for glazing replacement at Pelham Place" },
];

const SPEND = [
  { n: "Heating & Gas", pct: 82, v: "£6,840" },
  { n: "Electrical", pct: 68, v: "£5,720" },
  { n: "Plumbing", pct: 54, v: "£4,490" },
  { n: "Compliance", pct: 48, v: "£3,980" },
  { n: "Handyman", pct: 38, v: "£3,180" },
  { n: "Cleaning", pct: 22, v: "£1,840" },
  { n: "Locks & Access", pct: 18, v: "£1,520" },
];

const TOP_SITES = [
  { n: "Office, 14 Exmouth Market", s: "EC1R 4QE · Islington", v: "£8,420", rag: "r" },
  { n: "Communal, Queen's Gate", s: "SW7 5HW · Kensington", v: "£5,240", rag: "a" },
  { n: "Flat 4, 52 Marylebone Lane", s: "W1U 2NH · Marylebone", v: "£3,180", rag: "a" },
  { n: "Shopfront, 42 Upper Street", s: "N1 0PN · Islington", v: "£2,440", rag: "g" },
];

const CHART = [
  { c: 8 }, { c: 11 }, { c: 9 }, { c: 14 }, { c: 12 }, { c: 16 },
  { c: 9 }, { c: 18 }, { c: 22 }, { c: 15 }, { c: 24 }, { c: 19 },
];

const MAP_PINS = [
  { x: 18, y: 42, s: "g" }, { x: 22, y: 38, s: "a" }, { x: 28, y: 46, s: "g" }, { x: 32, y: 40, s: "g" },
  { x: 34, y: 50, s: "r" }, { x: 38, y: 44, s: "g" }, { x: 42, y: 48, s: "g" }, { x: 46, y: 52, s: "g" },
  { x: 50, y: 46, s: "a" }, { x: 54, y: 42, s: "g" }, { x: 58, y: 50, s: "g" }, { x: 62, y: 44, s: "g" },
  { x: 66, y: 48, s: "g" }, { x: 70, y: 40, s: "a" }, { x: 74, y: 46, s: "g" },
];

export default function DashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="page">
      {/* Header */}
      <div className="page-hdr">
        <div>
          <div className="kicker">{dateStr}</div>
          <h1>Good afternoon, Priya.</h1>
          <p className="sub">
            You have <b style={{ color: "var(--coral-600)" }}>2 quotes awaiting approval</b> and <b>1 overdue job</b>. Everything else is on track.
          </p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Export snapshot</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> New request</button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="kpi-grid">
        {KPIS.map((k, i) => (
          <div key={i} className="kpi">
            <span className="label">{k.label}</span>
            <div className={`value${k.coral ? " coral" : ""}`}>{k.value}</div>
            <div className={`trend ${k.trend}`}>{k.trendTxt}</div>
          </div>
        ))}
      </div>

      {/* Map + Urgent actions */}
      <div className="split-2-1 mt-20">
        <div className="block">
          <div className="block-hdr">
            <div>
              <h3>Portfolio map</h3>
              <div className="sub">42 sites · 14 active · 1 overdue</div>
            </div>
            <div className="actions">
              <span className="filter-chip">All branches <Icon name="down" size={10} /></span>
              <button className="btn btn-ghost btn-sm">View all</button>
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div className="map">
              <svg className="map-svg" viewBox="0 0 800 280" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}>
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="800" height="280" fill="url(#grid)" />
                <path d="M0,170 Q120,130 200,155 T400,150 T600,165 T800,150" stroke="rgba(100,180,255,0.15)" strokeWidth="22" fill="none" />
                <path d="M0,170 Q120,130 200,155 T400,150 T600,165 T800,150" stroke="rgba(100,180,255,0.3)" strokeWidth="1.5" fill="none" />
                <circle cx="260" cy="110" r="55" fill="rgba(255,255,255,0.03)" />
                <circle cx="420" cy="130" r="70" fill="rgba(255,255,255,0.03)" />
                <circle cx="560" cy="100" r="50" fill="rgba(255,255,255,0.03)" />
                <text x="260" y="78" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" fontFamily="var(--mono)">MARYLEBONE · 24</text>
                <text x="420" y="90" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" fontFamily="var(--mono)">ISLINGTON · 9</text>
                <text x="560" y="60" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" fontFamily="var(--mono)">KENSINGTON · 9</text>
              </svg>
              {MAP_PINS.map((pin, i) => (
                <div key={i} className="map-pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                  <div className={`p ${pin.s}`} />
                </div>
              ))}
              <div className="map-legend">
                <div className="lg"><div className="d" style={{ background: "var(--green)" }} /> On track · 37</div>
                <div className="lg"><div className="d" style={{ background: "var(--amber)" }} /> Attention · 4</div>
                <div className="lg"><div className="d" style={{ background: "var(--red)" }} /> Overdue · 1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="block">
          <div className="block-hdr">
            <div><h3>Urgent actions</h3><div className="sub">Needs you today</div></div>
          </div>
          <div style={{ padding: 0 }}>
            <div className="feed-item" style={{ background: "#FFF5EE", borderLeft: "3px solid var(--coral)", paddingLeft: 15 }}>
              <div className="feed-dot coral">£</div>
              <div className="feed-body">
                <div className="ln"><b>Approve £485.00 quote</b> — EICR at 14 Exmouth Market</div>
                <div className="meta"><span>Volt Compliance Ltd</span>·<span>Expires in 18h</span></div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-dot amber">!</div>
              <div className="feed-body">
                <div className="ln"><b>JOB-2471 overdue</b> — Communal lighting, Queen&apos;s Gate</div>
                <div className="meta"><span>H&amp;S flag</span>·<span>Triaged 2 days ago</span></div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-dot amber">◆</div>
              <div className="feed-body">
                <div className="ln"><b>EICR expires in 21 days</b> — 14 Exmouth Market</div>
                <div className="meta"><span>Compliance</span>·<span>Book a certificate</span></div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-dot">£</div>
              <div className="feed-body">
                <div className="ln"><b>Invoice FX-INV-4378 overdue</b> — £540.00, Flat 4 Marylebone Lane</div>
                <div className="meta"><span>Finance</span>·<span>Due 28 Mar</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity + Spend */}
      <div className="split-2-1 mt-20">
        <div className="block">
          <div className="block-hdr">
            <div><h3>Activity</h3><div className="sub">Live updates across your portfolio</div></div>
            <div className="actions">
              <span className="filter-chip active">All <Icon name="down" size={10} /></span>
              <button className="btn btn-ghost btn-sm">View feed</button>
            </div>
          </div>
          <div className="feed">
            {FEED.map((f, i) => (
              <div key={i} className="feed-item">
                <div className={`feed-dot ${f.dot}`}>{f.ic}</div>
                <div className="feed-body">
                  <div className="ln">{f.body}</div>
                  <div className="meta"><span>{f.t}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="block">
            <div className="block-hdr"><div><h3>Spend by category</h3><div className="sub">Last 30 days</div></div></div>
            <div className="block-body">
              <div className="hbar">
                {SPEND.map((r, i) => (
                  <div key={i} className="hbar-row">
                    <div className="n">{r.n}</div>
                    <div className="t"><div className={`f ${i === 0 ? "coral" : ""}`} style={{ width: `${r.pct}%` }} /></div>
                    <div className="v">{r.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="block">
            <div className="block-hdr"><div><h3>Top spending sites</h3><div className="sub">This month</div></div></div>
            <div>
              {TOP_SITES.map((r, i) => (
                <div key={i} className="site-row">
                  <div>
                    <div className="name">{r.n}</div>
                    <div className="addr">{r.s}</div>
                  </div>
                  <div className={`rag rag-${r.rag}`} />
                  <div className="metric">{r.v}</div>
                  <div style={{ color: "var(--slate-30)" }}><Icon name="arrow" size={12} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-2 mt-20">
        <div className="block">
          <div className="block-hdr">
            <div><h3>Jobs this month</h3><div className="sub">Completed vs emergency</div></div>
            <div className="actions"><span className="filter-chip">30 days <Icon name="down" size={10} /></span></div>
          </div>
          <div className="block-body" style={{ paddingTop: 24 }}>
            <div className="chart-bars">
              {CHART.map((m, i) => (
                <div key={i} className="b" style={{ height: `${m.c * 3.5}px`, background: i === 11 ? "var(--coral)" : "var(--navy)" }}>
                  {i === 11 && <span className="v">{m.c}</span>}
                </div>
              ))}
            </div>
            <div className="chart-labels">
              {["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F"].map((d, i) => <span key={i}>{d}</span>)}
            </div>
          </div>
        </div>

        <div className="block">
          <div className="block-hdr"><div><h3>SLA performance</h3><div className="sub">Response + completion, last 30 days</div></div></div>
          <div className="block-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 10 }}>RESPONSE TIME</div>
                <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em" }}>94<span style={{ fontSize: 18, color: "var(--slate-50)" }}>%</span></div>
                <div style={{ fontSize: 12, color: "var(--green)", marginTop: 4 }}>↑ 6% vs last month</div>
                <div style={{ height: 6, background: "var(--slate-10)", borderRadius: 3, marginTop: 14, overflow: "hidden" }}>
                  <div style={{ width: "94%", height: "100%", background: "var(--green)" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--slate-50)", marginTop: 6, fontFamily: "var(--mono)" }}>SLA: 98% · Target: 90%</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--slate-50)", marginBottom: 10 }}>COMPLETION TIME</div>
                <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em" }}>88<span style={{ fontSize: 18, color: "var(--slate-50)" }}>%</span></div>
                <div style={{ fontSize: 12, color: "var(--amber)", marginTop: 4 }}>↓ 2% vs last month</div>
                <div style={{ height: 6, background: "var(--slate-10)", borderRadius: 3, marginTop: 14, overflow: "hidden" }}>
                  <div style={{ width: "88%", height: "100%", background: "var(--amber)" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--slate-50)", marginTop: 6, fontFamily: "var(--mono)" }}>SLA: 85% · Target: 85%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
