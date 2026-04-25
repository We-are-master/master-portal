"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerTabs } from "@/components/portal/drawer";
import { t } from "@/lib/account-type";
import type { PortalComplianceCert } from "@/lib/server-fetchers/portal-compliance";
import type { PortalPpmPlan } from "@/lib/server-fetchers/portal-ppm";
import type { PortalPropertyRow } from "@/lib/server-fetchers/portal-properties";

type ViewMode = "grid" | "list";
type Filter = "all" | "with_jobs" | "no_jobs";
type DrawerTab = "overview" | "ppm" | "compliance" | "documents" | "history";

interface Props {
  properties: PortalPropertyRow[];
  compliance: PortalComplianceCert[];
  ppm:        PortalPpmPlan[];
}

const CERT_PILL: Record<string, { l: string; cls: string }> = {
  ok:       { l: "Compliant", cls: "ok" },
  expiring: { l: "Expiring",  cls: "w" },
  expired:  { l: "Expired",   cls: "r" },
  missing:  { l: "Missing",   cls: "r" },
};

export function SitesClient({ properties, compliance, ppm }: Props) {
  const [view, setView]       = useState<ViewMode>("grid");
  const [filter, setFilter]   = useState<Filter>("all");
  const [openId, setOpenId]   = useState<string | null>(null);

  const open = useMemo(() => properties.find((p) => p.id === openId) ?? null, [properties, openId]);

  const propAlerts = useMemo(() => {
    const m = new Map<string | null, number>();
    for (const c of compliance) {
      if (c.status === "ok") continue;
      m.set(c.property_id, (m.get(c.property_id) ?? 0) + 1);
    }
    return m;
  }, [compliance]);

  const filtered = useMemo(() => {
    if (filter === "with_jobs") return properties.filter((p) => p.active_jobs > 0);
    if (filter === "no_jobs")   return properties.filter((p) => p.active_jobs === 0);
    return properties;
  }, [properties, filter]);

  const totalActiveJobs = properties.reduce((s, p) => s + p.active_jobs, 0);
  const totalCompliance = compliance.filter((c) => c.status !== "ok").length;
  const totalPpm        = ppm.filter((p) => p.status === "active").length;

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>{t("sitesPageTitle")}</h1>
          <p className="sub">Your full portfolio. Click a property to see PPM, compliance, documents and full job history.</p>
        </div>
        <div className="acts">
          <div className="view-tog">
            <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}>Grid</button>
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>List</button>
          </div>
        </div>
      </div>

      <div className="kg">
        <div className="kpi">
          <div className="lbl">Total {t("sitesPageTitle").toLowerCase()}</div>
          <div className="val">{properties.length}</div>
          <div className="tr flat">In your portfolio</div>
        </div>
        <div className="kpi">
          <div className="lbl">Active jobs</div>
          <div className="val">{totalActiveJobs}</div>
          <div className="tr flat">In progress now</div>
        </div>
        <div className="kpi">
          <div className="lbl">Compliance alerts</div>
          <div className="val" style={{ color: totalCompliance > 0 ? "var(--am)" : "var(--gr)" }}>{totalCompliance}</div>
          <div className="tr flat">Need attention</div>
        </div>
        <div className="kpi">
          <div className="lbl">PPM plans</div>
          <div className="val">{totalPpm}</div>
          <div className="tr flat">Active schedules</div>
        </div>
      </div>

      <div className="tbar" style={{ border: "1px solid var(--ln)", borderRadius: 6, marginBottom: 14 }}>
        <div className="srch">
          <span style={{ fontSize: 13, color: "var(--s50)" }}>⌕</span>
          <input placeholder={`Search ${t("sitesPageTitle").toLowerCase()}…`} />
        </div>
        {(["all", "with_jobs", "no_jobs"] as Filter[]).map((f) => (
          <span key={f} className={`fc${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "with_jobs" ? "With active jobs" : "No active jobs"}
          </span>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="ic-lg">◇</div>
          <div className="t">No {t("sitesPageTitle").toLowerCase()} yet</div>
          <div className="s">Your account manager will add properties here as the portfolio grows.</div>
        </div>
      ) : view === "grid" ? (
        <div className="prop-grid">
          {filtered.map((p) => {
            const alerts = propAlerts.get(p.id) ?? 0;
            return (
              <div key={p.id} className="prop-card-g" onClick={() => setOpenId(p.id)} style={{ cursor: "pointer" }}>
                <div className="img" style={{ background: "linear-gradient(135deg,#E4E8F5,#C0C8DB)" }}>
                  {alerts > 0 && (
                    <span className="rag w" style={{ position: "absolute", top: 10, right: 10 }}>
                      {alerts} alert{alerts > 1 ? "s" : ""}
                    </span>
                  )}
                  <div className="ov">
                    <span className="tg">{p.property_type}</span>
                    {p.active_jobs > 0 && <span className="tg">{p.active_jobs} active</span>}
                  </div>
                </div>
                <div className="body">
                  <div className="name">{p.name}</div>
                  <div className="addr">{p.full_address}</div>
                  <div className="stats">
                    <div className="stat">
                      <div className="v">{p.active_jobs}</div>
                      <div className="l">Open jobs</div>
                    </div>
                    <div className="stat">
                      <div className="v">{compliance.filter((c) => c.property_id === p.id).length}</div>
                      <div className="l">Certs</div>
                    </div>
                    <div className="stat">
                      <div className="v">{ppm.filter((pl) => pl.property_id === p.id).length}</div>
                      <div className="l">PPM</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="blk">
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Address</th>
                <th>Site contact</th>
                <th>Open jobs</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const alerts = propAlerts.get(p.id) ?? 0;
                return (
                  <tr key={p.id} onClick={() => setOpenId(p.id)} style={{ cursor: "pointer" }}>
                    <td className="b">{p.name}</td>
                    <td style={{ fontSize: 12 }}>{p.property_type}</td>
                    <td style={{ fontSize: 12 }}>{p.full_address}</td>
                    <td style={{ fontSize: 12 }}>{p.primary_contact_name ?? "—"}</td>
                    <td className="b mono">{p.active_jobs}</td>
                    <td>
                      {alerts > 0 ? (
                        <span className="pill w"><span className="d" />{alerts} alert{alerts > 1 ? "s" : ""}</span>
                      ) : (
                        <span className="pill ok"><span className="d" />Compliant</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <PropertyDrawer
          property={open}
          compliance={compliance.filter((c) => c.property_id === open.id)}
          ppm={ppm.filter((p) => p.property_id === open.id)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function PropertyDrawer({
  property,
  compliance,
  ppm,
  onClose,
}: {
  property:   PortalPropertyRow;
  compliance: PortalComplianceCert[];
  ppm:        PortalPpmPlan[];
  onClose:    () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("overview");

  return (
    <Drawer open={true} onClose={onClose}>
      <DrawerHeader title={property.name} meta={`${property.full_address} · ${property.property_type}`} onClose={onClose} />
      <div style={{ padding: "0 20px" }}>
        <DrawerTabs<DrawerTab>
          tabs={[
            { id: "overview",   label: "Overview" },
            { id: "ppm",        label: t("ppm"),        count: ppm.length },
            { id: "compliance", label: "Compliance",    count: compliance.length },
            { id: "documents",  label: "Documents" },
            { id: "history",    label: "Job history" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <DrawerBody>
        {tab === "overview" && (
          <div className="kg">
            <div className="kpi">
              <div className="lbl">Open jobs</div>
              <div className="val">{property.active_jobs}</div>
              <div className="tr flat">Active</div>
            </div>
            <div className="kpi">
              <div className="lbl">Compliance certs</div>
              <div className="val">{compliance.length}</div>
              <div className="tr flat">{compliance.filter((c) => c.status !== "ok").length} need attention</div>
            </div>
            <div className="kpi">
              <div className="lbl">{t("ppm")}</div>
              <div className="val">{ppm.length}</div>
              <div className="tr flat">{ppm.filter((p) => p.status === "active").length} active</div>
            </div>
          </div>
        )}

        {tab === "ppm" && (
          ppm.length === 0 ? (
            <div className="empty"><div className="ic-lg">·</div><div className="t">No {t("ppm").toLowerCase()} yet</div></div>
          ) : (
            ppm.map((p) => (
              <div key={p.id} className="ppm-card" style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="bold">{p.name}</div>
                    <div className="mu mono">
                      {p.service_name ?? "—"}
                      {p.next_visit_date && ` · Next ${new Date(p.next_visit_date).toLocaleDateString("en-GB")}`}
                    </div>
                  </div>
                  <span className="freq">{p.frequency.replace(/_/g, " ")}</span>
                </div>
              </div>
            ))
          )
        )}

        {tab === "compliance" && (
          compliance.length === 0 ? (
            <div className="empty">
              <div className="ic-lg">✓</div>
              <div className="t">No certificates registered</div>
              <div className="s">Your account manager registers compliance certificates as inspections complete.</div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Certificate</th>
                  <th>Issued</th>
                  <th>Expires</th>
                  <th>Days left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {compliance.map((c) => {
                  const pill = CERT_PILL[c.status] ?? { l: c.status, cls: "n" };
                  return (
                    <tr key={c.id}>
                      <td className="b">{c.certificate_type.replace(/_/g, " ").toUpperCase()}</td>
                      <td className="mono mu">
                        {c.issued_date ? new Date(c.issued_date).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="mono mu">
                        {new Date(c.expiry_date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="mono b" style={{
                        color: c.days_left < 0 ? "var(--rd)" : c.days_left < 30 ? "var(--am)" : "var(--ink)",
                      }}>
                        {c.days_left < 0 ? `${Math.abs(c.days_left)}d ago` : `${c.days_left}d`}
                      </td>
                      <td><span className={`pill ${pill.cls}`}><span className="d" />{pill.l}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {tab === "documents" && (
          <div className="empty">
            <div className="ic-lg">📁</div>
            <div className="t">Documents view ships in the next release</div>
            <div className="s">Per-property document library with category filtering is coming soon.</div>
          </div>
        )}

        {tab === "history" && (
          <div className="empty">
            <div className="ic-lg">📜</div>
            <div className="t">Job history filtered to this {t("sitesSingular")}</div>
            <div className="s">See the History page meanwhile for all jobs across the account.</div>
          </div>
        )}
      </DrawerBody>

      <DrawerFooter>
        <button className="btn btn-g btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-p btn-sm">Log request for this {t("sitesSingular")}</button>
      </DrawerFooter>
    </Drawer>
  );
}
