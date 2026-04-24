"use client";

import Link from "next/link";
import { getAccountMeta, t } from "@/lib/account-type";
import { JOBS_ALL, PROPERTIES } from "@/lib/mocks/portal-v2";

const AM = {
  real_estate: { name: "Rachel Okonkwo", title: "Account Manager", avatar: "👩‍💼" },
  franchise: { name: "James Whitmore", title: "Account Manager", avatar: "👨‍💼" },
  service: { name: "Marcus Reid", title: "Account Manager", avatar: "👨‍💼" },
  enterprise: { name: "Sarah Chen", title: "Account Manager", avatar: "👩‍💼" },
} as const;

const CERT_ROLLUP = [
  { l: "Gas Safe", tot: 24, ok: 22, w: 2, r: 0 },
  { l: "EICR", tot: 18, ok: 15, w: 2, r: 1 },
  { l: "PAT", tot: 12, ok: 11, w: 1, r: 0 },
  { l: "Fire Safety", tot: 8, ok: 8, w: 0, r: 0 },
];

const SPEND_BY_SERVICE = [
  { n: "Plumbing", pct: 72, v: "£6,840" },
  { n: "Electrical", pct: 58, v: "£5,520" },
  { n: "Cleaning", pct: 42, v: "£3,980" },
  { n: "HVAC", pct: 34, v: "£3,240" },
  { n: "Compliance", pct: 24, v: "£2,280" },
];

const KPI = {
  openJobs: 14,
  spent: 28420,
  slaScore: 94,
  sites: 42,
};

function todayStr() {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function DashboardPage() {
  const meta = getAccountMeta();
  const am = AM[meta.key];
  const isRealEstate = meta.key === "real_estate";

  const expiries = PROPERTIES.flatMap((p) => p.certs.map((c) => ({ ...c, prop: p.name })))
    .filter((c) => c.daysLeft <= 120)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const alerts = expiries.filter((c) => c.status !== "ok").length;

  const activeJobs = JOBS_ALL.filter((j) => j.status !== "completed" && j.status !== "cancelled").slice(0, 4);
  const upcoming = JOBS_ALL.filter((j) => j.status === "upcoming").slice(0, 3);

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="kk">{todayStr()}</div>
          <h1>
            Good morning. Welcome back.
            {isRealEstate && <span className="badge-soon" style={{ marginLeft: 4 }}>{t("tenantApp")}</span>}
          </h1>
          <p className="sub">{KPI.openJobs} open jobs. Fixfy is handling everything. Sit back.</p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">Export report</button>
          <Link href="/requests" className="btn btn-p" style={{ textDecoration: "none" }}>
            + New request
          </Link>
        </div>
      </div>

      <div className="kg">
        <div className="kpi">
          <div className="lbl">Open jobs</div>
          <div className="val" style={{ color: "var(--co)" }}>{KPI.openJobs}</div>
          <div className="tr flat">Fixfy managing</div>
        </div>
        <div className="kpi">
          <div className="lbl">Spent MTD</div>
          <div className="val" style={{ fontSize: 18 }}>£{KPI.spent.toLocaleString()}</div>
          <div className="tr">↑ 8% vs last month</div>
        </div>
        <div className="kpi">
          <div className="lbl">SLA compliance</div>
          <div className="val" style={{ color: "var(--gr)" }}>{KPI.slaScore}%</div>
          <div className="tr">All services</div>
        </div>
        <div className="kpi">
          <div className="lbl">{t("sites")}</div>
          <div className="val">{KPI.sites}</div>
          <div className="tr flat">{meta.type}</div>
        </div>
      </div>

      <div className="s21">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="blk">
            <div className="bh">
              <h3>Active jobs</h3>
              <Link href="/jobs" className="btn btn-g btn-sm" style={{ textDecoration: "none" }}>View all</Link>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Service</th>
                  <th>Site</th>
                  <th>SLA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <div className="b">{j.title}</div>
                      <div className="mu mono">{j.id}</div>
                    </td>
                    <td><span className="pill n">{j.svc}</span></td>
                    <td style={{ fontSize: 12 }}>{j.site}</td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 11,
                          color: j.slaPct < 50 ? "var(--rd)" : j.slaPct < 75 ? "var(--am)" : "var(--gr)",
                        }}
                      >
                        {j.sla}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${j.status === "in_progress" ? "c" : j.status === "awaiting_report" ? "w" : "b"}`}>
                        <span className="d" />
                        {j.status === "in_progress" ? "In progress" : j.status === "awaiting_report" ? "Awaiting report" : "Upcoming"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="blk">
            <div className="bh">
              <h3>Compliance overview</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {alerts > 0 && (
                  <span className="pill w">
                    <span className="d" />
                    {alerts} alert{alerts > 1 ? "s" : ""}
                  </span>
                )}
                <Link href="/sites" className="btn btn-g btn-sm" style={{ textDecoration: "none" }}>Manage</Link>
              </div>
            </div>
            <div className="bb" style={{ padding: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                <div style={{ padding: 14, borderRight: "1px solid var(--ln)" }}>
                  <div className="kk" style={{ marginBottom: 8 }}>Certificates across portfolio</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
                    {CERT_ROLLUP.map((c) => {
                      const pct = Math.round((c.ok / c.tot) * 100);
                      return (
                        <div key={c.l} style={{ border: "1px solid var(--ln)", borderRadius: 5, padding: "8px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: 9.5,
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                                color: "var(--s50)",
                              }}
                            >
                              {c.l}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: 11,
                                fontWeight: 500,
                                color: pct === 100 ? "var(--gr)" : pct >= 85 ? "var(--am)" : "var(--rd)",
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                            {Array.from({ length: c.tot }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: 4,
                                  height: 10,
                                  borderRadius: 1,
                                  background:
                                    i < c.ok ? "var(--gr)" : i < c.ok + c.w ? "var(--am)" : "var(--rd)",
                                }}
                              />
                            ))}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--s50)", marginTop: 4 }}>
                            {c.ok}/{c.tot} compliant{c.w > 0 ? ` · ${c.w} expiring` : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ padding: 14 }}>
                  <div className="kk" style={{ marginBottom: 8 }}>Upcoming expiries (next 120 days)</div>
                  {expiries.slice(0, 5).map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "7px 0",
                        borderBottom: i < 4 ? "1px solid var(--ln)" : "none",
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: e.status === "ok" ? "var(--gr)" : e.status === "w" ? "var(--am)" : "var(--rd)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {e.n}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--s50)",
                            fontFamily: "var(--mono)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {e.prop}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 11,
                            fontWeight: 500,
                            color:
                              e.daysLeft < 30 ? "var(--rd)" : e.daysLeft < 60 ? "var(--am)" : "var(--s70)",
                          }}
                        >
                          {e.daysLeft}d
                        </div>
                        <div style={{ fontSize: 9, color: "var(--s50)" }}>{e.exp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="am-card">
            <div className="am-ava">{am.avatar}</div>
            <div style={{ flex: 1 }}>
              <div className="am-name">{am.name}</div>
              <div className="am-title">{am.title}</div>
              <div className="am-btns">
                <button className="am-btn">📞 Call</button>
                <button className="am-btn">✉ Email</button>
                <button className="am-btn">💬 WhatsApp</button>
              </div>
            </div>
          </div>

          <div className="blk">
            <div className="bh">
              <h3>Spend by service</h3>
              <span style={{ fontSize: 11, color: "var(--s50)" }}>Last 30d</span>
            </div>
            <div className="bb">
              {SPEND_BY_SERVICE.map((r) => (
                <div
                  key={r.n}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 70px",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  <span className="bold">{r.n}</span>
                  <div style={{ height: 5, background: "var(--s10)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${r.pct}%`, height: "100%", background: "var(--n)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, textAlign: "right", color: "var(--s70)" }}>
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="blk">
            <div className="bh"><h3>This week</h3></div>
            {upcoming.map((j) => (
              <div
                key={j.id}
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--ln)",
                  fontSize: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div className="bold">{j.title}</div>
                  <div style={{ color: "var(--s50)", fontSize: 10, fontFamily: "var(--mono)" }}>{j.date}</div>
                </div>
                <span className="pill n">{j.svc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
