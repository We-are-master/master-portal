"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerTabs } from "@/components/portal/drawer";
import { t } from "@/lib/account-type";
import type { PortalComplianceCert } from "@/lib/server-fetchers/portal-compliance";
import type { PortalJobRow } from "@/lib/server-fetchers/portal-jobs";
import type { PortalPpmPlan } from "@/lib/server-fetchers/portal-ppm";
import type { PortalPropertyRow } from "@/lib/server-fetchers/portal-properties";
import type { PortalPropertyDocument } from "@/lib/server-fetchers/portal-property-detail";

type ViewMode = "grid" | "list";
type Filter = "all" | "with_jobs" | "no_jobs";
type DrawerTab = "overview" | "ppm" | "compliance" | "documents" | "history";

interface Props {
  properties: PortalPropertyRow[];
  compliance: PortalComplianceCert[];
  ppm:        PortalPpmPlan[];
  documents:  PortalPropertyDocument[];
  jobs:       PortalJobRow[];
}

const CERT_PILL: Record<string, { l: string; cls: string }> = {
  ok:       { l: "Compliant", cls: "ok" },
  expiring: { l: "Expiring",  cls: "w" },
  expired:  { l: "Expired",   cls: "r" },
  missing:  { l: "Missing",   cls: "r" },
};

export function SitesClient({ properties, compliance, ppm, documents, jobs }: Props) {
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
          documents={documents.filter((d) => d.property_id === open.id)}
          jobs={jobs.filter((j) => j.property_id === open.id)}
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
  documents,
  jobs,
  onClose,
}: {
  property:   PortalPropertyRow;
  compliance: PortalComplianceCert[];
  ppm:        PortalPpmPlan[];
  documents:  PortalPropertyDocument[];
  jobs:       PortalJobRow[];
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
            { id: "documents",  label: "Documents",     count: documents.length },
            { id: "history",    label: "Job history",   count: jobs.length },
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
          documents.length === 0 ? (
            <div className="empty">
              <div className="ic-lg">📁</div>
              <div className="t">No documents on file yet</div>
              <div className="s">Documents uploaded by your team or Fixfy staff will appear here.</div>
            </div>
          ) : (
            <div className="blk">
              {documents.map((d) => (
                <div key={d.id} className="doc-row">
                  <div className={`doc-ic ${d.document_type === "compliance" ? "enc" : d.file_name.toLowerCase().endsWith(".pdf") ? "pdf" : "img"}`}>
                    {d.file_name.split(".").pop()?.slice(0, 4).toUpperCase() ?? "DOC"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="bold">{d.file_name}</div>
                    <div className="mu mono">
                      {d.document_type.replace(/_/g, " ")} · {d.size_bytes ? `${(d.size_bytes / 1024).toFixed(0)} KB` : "—"}
                      {" · "}{new Date(d.created_at).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <button className="btn btn-g btn-sm">↓</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "history" && (
          jobs.length === 0 ? (
            <div className="empty">
              <div className="ic-lg">📜</div>
              <div className="t">No jobs for this {t("sitesSingular")} yet</div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Date</th>
                  <th>Partner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const date = j.scheduled_date ?? j.scheduled_start_at ?? j.created_at;
                  return (
                    <tr key={j.id}>
                      <td>
                        <div className="b">{j.title}</div>
                        <div className="mu mono">{j.reference}</div>
                      </td>
                      <td className="mono mu">
                        {date ? new Date(date).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td style={{ fontSize: 12 }}>{j.partner_name ?? "—"}</td>
                      <td>
                        <span className="pill n">{j.status.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </DrawerBody>

      <DrawerFooter>
        <button className="btn btn-g btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-p btn-sm">Log request for this {t("sitesSingular")}</button>
      </DrawerFooter>
    </Drawer>
  );
}
