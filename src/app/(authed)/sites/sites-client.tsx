"use client";

import { useMemo, useState } from "react";
import { t } from "@/lib/account-type";
import type { PortalPropertyRow } from "@/lib/server-fetchers/portal-properties";

type ViewMode = "grid" | "list";
type Filter = "all" | "with_jobs" | "no_jobs";

interface Props {
  properties: PortalPropertyRow[];
}

export function SitesClient({ properties }: Props) {
  const [view, setView]   = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "with_jobs") return properties.filter((p) => p.active_jobs > 0);
    if (filter === "no_jobs")   return properties.filter((p) => p.active_jobs === 0);
    return properties;
  }, [properties, filter]);

  const totalActiveJobs = properties.reduce((s, p) => s + p.active_jobs, 0);

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>{t("sitesPageTitle")}</h1>
          <p className="sub">Your full portfolio. Each card links to PPM plans, compliance and a full job history.</p>
        </div>
        <div className="acts">
          <div className="view-tog">
            <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}>Grid</button>
            <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>List</button>
          </div>
          <button className="btn btn-p btn-sm">+ Add {t("sitesSingular")}</button>
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
          <div className="val">—</div>
          <div className="tr flat">Coming soon</div>
        </div>
        <div className="kpi">
          <div className="lbl">PPM plans</div>
          <div className="val">—</div>
          <div className="tr flat">Coming soon</div>
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
          {filtered.map((p) => (
            <div key={p.id} className="prop-card-g" style={{ cursor: "default" }}>
              <div className="img" style={{ background: "linear-gradient(135deg,#E4E8F5,#C0C8DB)" }}>
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
                  {p.primary_contact_name && (
                    <div className="stat" style={{ flex: 1 }}>
                      <div className="v" style={{ fontSize: 11, fontFamily: "var(--sans)" }}>
                        {p.primary_contact_name}
                      </div>
                      <div className="l">Site contact</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="b">{p.name}</td>
                  <td style={{ fontSize: 12 }}>{p.property_type}</td>
                  <td style={{ fontSize: 12 }}>{p.full_address}</td>
                  <td style={{ fontSize: 12 }}>{p.primary_contact_name ?? "—"}</td>
                  <td className="b mono">{p.active_jobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
