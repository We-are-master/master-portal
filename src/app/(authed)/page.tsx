import Link from "next/link";
import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { getAccountMeta, t } from "@/lib/account-type";
import { fetchAccountCompliance } from "@/lib/server-fetchers/portal-compliance";
import { fetchPortalDashboardKpis } from "@/lib/server-fetchers/portal-dashboard";
import { fetchAccountInvoices } from "@/lib/server-fetchers/portal-invoices";
import { fetchAccountJobs } from "@/lib/server-fetchers/portal-jobs";
import { fetchAccountProperties } from "@/lib/server-fetchers/portal-properties";
import { fetchAccountSpendByService } from "@/lib/server-fetchers/portal-spend";

export const dynamic = "force-dynamic";

const AM = {
  real_estate: { name: "Rachel Okonkwo", title: "Account Manager", avatar: "👩‍💼" },
  franchise:   { name: "James Whitmore",  title: "Account Manager", avatar: "👨‍💼" },
  service:     { name: "Marcus Reid",     title: "Account Manager", avatar: "👨‍💼" },
  enterprise:  { name: "Sarah Chen",      title: "Account Manager", avatar: "👩‍💼" },
} as const;

const STATUS_LABEL: Record<string, { l: string; cls: string }> = {
  scheduled:          { l: "Scheduled",       cls: "b" },
  in_progress_phase1: { l: "In progress",     cls: "c" },
  in_progress_phase2: { l: "In progress",     cls: "c" },
  in_progress_phase3: { l: "In progress",     cls: "c" },
  final_check:        { l: "Awaiting report", cls: "w" },
  awaiting_payment:   { l: "Awaiting payment", cls: "w" },
  completed:          { l: "Completed",       cls: "ok" },
  cancelled:          { l: "Cancelled",       cls: "r" },
  invoiced:           { l: "Invoiced",        cls: "ok" },
};

function todayStr() {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function isActive(status: string): boolean {
  return !["completed", "cancelled", "invoiced", "no_action", "closed"].includes(status);
}

export default async function DashboardPage() {
  const auth = await requirePortalUserOrRedirect();

  const [kpis, jobsPage, properties, invoices, compliance, spendByService] = await Promise.all([
    fetchPortalDashboardKpis(auth.accountId),
    fetchAccountJobs(auth.accountId),
    fetchAccountProperties(auth.accountId),
    fetchAccountInvoices(auth.accountId),
    fetchAccountCompliance(auth.accountId),
    fetchAccountSpendByService(auth.accountId, 30),
  ]);
  const jobs = jobsPage.items;

  // Roll up cert state by certificate_type for the dashboard summary.
  const CERT_GROUPS = ["gas_safe", "eicr", "pat", "fire_safety"] as const;
  const certRollup = CERT_GROUPS.map((g) => {
    const certs = compliance.filter((c) => c.certificate_type === g);
    const tot = certs.length;
    const ok  = certs.filter((c) => c.status === "ok").length;
    const w   = certs.filter((c) => c.status === "expiring").length;
    const r   = certs.filter((c) => c.status === "expired" || c.status === "missing").length;
    const labelMap: Record<string, string> = {
      gas_safe: "Gas Safe",
      eicr: "EICR",
      pat: "PAT",
      fire_safety: "Fire Safety",
    };
    return { l: labelMap[g], tot, ok, w, r };
  });

  const expiries = compliance
    .filter((c) => c.days_left <= 120)
    .sort((a, b) => a.days_left - b.days_left)
    .slice(0, 5);

  const propNameMap = new Map<string, string>();
  for (const p of properties) propNameMap.set(p.id, p.name);

  const certAlerts = compliance.filter((c) => c.status !== "ok").length;

  const totalSpend = spendByService.reduce((s, r) => s + Number(r.total_spend ?? 0), 0);
  const maxSpend   = Math.max(1, ...spendByService.map((r) => Number(r.total_spend ?? 0)));

  const meta         = getAccountMeta();
  const am           = AM[meta.key];
  const isRealEstate = meta.key === "real_estate";

  const activeJobs = jobs.filter((j) => isActive(j.status)).slice(0, 4);

  const inWeek = (d: string | null): boolean => {
    if (!d) return false;
    const t = new Date(d).getTime();
    const now = Date.now();
    return t >= now && t <= now + 7 * 24 * 60 * 60 * 1000;
  };
  const upcoming = jobs
    .filter((j) => isActive(j.status) && inWeek(j.scheduled_date ?? j.scheduled_start_at))
    .slice(0, 3);

  const spentMtd = invoices.paid.reduce((s, i) => s + Number(i.amount_paid ?? i.amount ?? 0), 0);

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="kk">{todayStr()}</div>
          <h1>
            Good morning. Welcome back.
            {isRealEstate && <span className="badge-soon" style={{ marginLeft: 4 }}>{t("tenantApp")}</span>}
          </h1>
          <p className="sub">{kpis.jobsInProgress} open jobs. Fixfy is handling everything. Sit back.</p>
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
          <div className="val" style={{ color: "var(--co)" }}>{kpis.jobsInProgress}</div>
          <div className="tr flat">Fixfy managing</div>
        </div>
        <div className="kpi">
          <div className="lbl">Spent MTD</div>
          <div className="val" style={{ fontSize: 18 }}>£{spentMtd.toLocaleString()}</div>
          <div className="tr flat">From paid invoices</div>
        </div>
        <div className="kpi">
          <div className="lbl">Awaiting your action</div>
          <div className="val" style={{ color: "var(--am)" }}>{kpis.pendingQuotes}</div>
          <div className="tr flat">Quotes to review</div>
        </div>
        <div className="kpi">
          <div className="lbl">{t("sites")}</div>
          <div className="val">{properties.length}</div>
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
            {activeJobs.length === 0 ? (
              <div className="empty">
                <div className="ic-lg">✓</div>
                <div className="t">No active jobs</div>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Site</th>
                    <th>Partner</th>
                    <th>Phase</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeJobs.map((j) => {
                    const s = STATUS_LABEL[j.status] ?? { l: j.status.replace(/_/g, " "), cls: "n" };
                    return (
                      <tr key={j.id}>
                        <td>
                          <div className="b">{j.title}</div>
                          <div className="mu mono">{j.reference}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{j.property_address ?? "—"}</td>
                        <td style={{ fontSize: 12 }}>{j.partner_name ?? "—"}</td>
                        <td className="mono mu">
                          {j.current_phase != null && j.total_phases ? `${j.current_phase}/${j.total_phases}` : "—"}
                        </td>
                        <td>
                          <span className={`pill ${s.cls}`}><span className="d" />{s.l}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="blk">
            <div className="bh">
              <h3>Compliance overview</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {certAlerts > 0 && (
                  <span className="pill w">
                    <span className="d" />
                    {certAlerts} alert{certAlerts > 1 ? "s" : ""}
                  </span>
                )}
                <Link href="/sites" className="btn btn-g btn-sm" style={{ textDecoration: "none" }}>Manage</Link>
              </div>
            </div>
            {compliance.length === 0 ? (
              <div className="bb">
                <p style={{ fontSize: 12, color: "var(--s50)" }}>
                  No compliance certificates registered for your account yet. Your account manager
                  registers them after each inspection.
                </p>
              </div>
            ) : (
              <div className="bb" style={{ padding: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ padding: 14, borderRight: "1px solid var(--ln)" }}>
                    <div className="kk" style={{ marginBottom: 8 }}>Certificates across portfolio</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
                      {certRollup.map((c) => {
                        const pct = c.tot === 0 ? 0 : Math.round((c.ok / c.tot) * 100);
                        return (
                          <div key={c.l} style={{ border: "1px solid var(--ln)", borderRadius: 5, padding: "8px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--s50)" }}>
                                {c.l}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: 11,
                                  fontWeight: 500,
                                  color:
                                    c.tot === 0 ? "var(--s50)" :
                                    pct === 100 ? "var(--gr)" :
                                    pct >= 85 ? "var(--am)" : "var(--rd)",
                                }}
                              >
                                {c.tot === 0 ? "—" : `${pct}%`}
                              </span>
                            </div>
                            {c.tot > 0 && (
                              <>
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
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div className="kk" style={{ marginBottom: 8 }}>Upcoming expiries (next 120 days)</div>
                    {expiries.length === 0 ? (
                      <span style={{ fontSize: 12, color: "var(--s50)" }}>Nothing expiring soon.</span>
                    ) : (
                      expiries.map((e, i) => (
                        <div
                          key={e.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "7px 0",
                            borderBottom: i < expiries.length - 1 ? "1px solid var(--ln)" : "none",
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background:
                                e.status === "ok" ? "var(--gr)" :
                                e.status === "expiring" ? "var(--am)" : "var(--rd)",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {e.certificate_type.replace(/_/g, " ").toUpperCase()}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--s50)", fontFamily: "var(--mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {e.property_id ? (propNameMap.get(e.property_id) ?? "—") : "Account-wide"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: 11,
                                fontWeight: 500,
                                color:
                                  e.days_left < 0 ? "var(--rd)" :
                                  e.days_left < 30 ? "var(--rd)" :
                                  e.days_left < 60 ? "var(--am)" : "var(--s70)",
                              }}
                            >
                              {e.days_left < 0 ? `${Math.abs(e.days_left)}d ago` : `${e.days_left}d`}
                            </div>
                            <div style={{ fontSize: 9, color: "var(--s50)" }}>
                              {new Date(e.expiry_date).toLocaleDateString("en-GB")}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
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
            {spendByService.length === 0 ? (
              <div className="bb">
                <span style={{ fontSize: 12, color: "var(--s50)" }}>
                  No spend in the last 30 days.
                </span>
              </div>
            ) : (
              <div className="bb">
                {spendByService.map((r) => {
                  const pct = Math.round((Number(r.total_spend) / maxSpend) * 100);
                  return (
                    <div
                      key={r.service_name}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 1fr 80px",
                        gap: 8,
                        alignItems: "center",
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span className="bold" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.service_name}
                      </span>
                      <div style={{ height: 5, background: "var(--s10)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--n)", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, textAlign: "right", color: "var(--s70)" }}>
                        £{Number(r.total_spend).toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  );
                })}
                <div style={{ borderTop: "1px solid var(--ln)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--s50)" }}>
                  <span>Total</span>
                  <span className="mono bold" style={{ color: "var(--ink)" }}>£{totalSpend.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            )}
          </div>

          <div className="blk">
            <div className="bh">
              <h3>Recent activity</h3>
              <span style={{ fontSize: 11, color: "var(--s50)" }}>Last 30d</span>
            </div>
            <div style={{ padding: 0 }}>
              {kpis.recentActivity.length === 0 ? (
                <div className="bb"><span style={{ fontSize: 12, color: "var(--s50)" }}>No activity yet.</span></div>
              ) : (
                kpis.recentActivity.map((a) => (
                  <div
                    key={`${a.type}-${a.id}`}
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
                      <div className="bold">{a.title}</div>
                      <div style={{ color: "var(--s50)", fontSize: 10, fontFamily: "var(--mono)" }}>
                        {a.reference} · {new Date(a.created_at).toLocaleDateString("en-GB")}
                      </div>
                    </div>
                    <span className="pill n">{a.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="blk">
            <div className="bh"><h3>This week</h3></div>
            {upcoming.length === 0 ? (
              <div className="bb"><span style={{ fontSize: 12, color: "var(--s50)" }}>Nothing scheduled this week.</span></div>
            ) : (
              upcoming.map((j) => (
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
                    <div style={{ color: "var(--s50)", fontSize: 10, fontFamily: "var(--mono)" }}>
                      {j.scheduled_date
                        ? new Date(j.scheduled_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                        : "Pending schedule"}
                    </div>
                  </div>
                  {j.partner_name && <span className="pill n">{j.partner_name}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

