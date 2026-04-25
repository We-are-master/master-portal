import Link from "next/link";
import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { getAccountMeta, t } from "@/lib/account-type";
import { fetchPortalDashboardKpis } from "@/lib/server-fetchers/portal-dashboard";
import { fetchAccountJobs } from "@/lib/server-fetchers/portal-jobs";
import { fetchAccountProperties } from "@/lib/server-fetchers/portal-properties";

export const dynamic = "force-dynamic";

const AM = {
  real_estate: { name: "Rachel Okonkwo", title: "Account Manager", avatar: "👩‍💼" },
  franchise:   { name: "James Whitmore",  title: "Account Manager", avatar: "👨‍💼" },
  service:     { name: "Marcus Reid",     title: "Account Manager", avatar: "👨‍💼" },
  enterprise:  { name: "Sarah Chen",      title: "Account Manager", avatar: "👩‍💼" },
} as const;

// Static placeholders — wired in PR 3 once compliance certs / spend RPCs ship.
const CERT_ROLLUP = [
  { l: "Gas Safe",   tot: 0, ok: 0, w: 0, r: 0 },
  { l: "EICR",       tot: 0, ok: 0, w: 0, r: 0 },
  { l: "PAT",        tot: 0, ok: 0, w: 0, r: 0 },
  { l: "Fire Safety", tot: 0, ok: 0, w: 0, r: 0 },
];
const SPEND_BY_SERVICE: Array<{ n: string; pct: number; v: string }> = [];

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

  const [kpis, jobs, properties, invoices] = await Promise.all([
    fetchPortalDashboardKpis(auth.accountId),
    fetchAccountJobs(auth.accountId),
    fetchAccountProperties(auth.accountId),
    // Outstanding total is already in kpis but reuse the rolled-up
    // amount from invoices fetcher for the Spent MTD figure.
    import("@/lib/server-fetchers/portal-invoices").then((m) =>
      m.fetchAccountInvoices(auth.accountId),
    ),
  ]);

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
              <Link href="/sites" className="btn btn-g btn-sm" style={{ textDecoration: "none" }}>Manage</Link>
            </div>
            <div className="bb">
              <div className="kk" style={{ marginBottom: 8 }}>Coming in next release</div>
              <p style={{ fontSize: 12, color: "var(--s50)" }}>
                Compliance certificate tracking ships with the next backend update. We&rsquo;ll surface
                Gas Safe / EICR / PAT / Fire-safety expiries here.
              </p>
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

// Defensive: avoid unused-import warnings if these become referenced later.
void CERT_ROLLUP;
void SPEND_BY_SERVICE;
