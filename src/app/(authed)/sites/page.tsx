"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerTabs } from "@/components/portal/drawer";
import { PropScene } from "@/components/portal/prop-scene";
import { PROPERTIES, type MockProperty } from "@/lib/mocks/portal-v2";
import { t } from "@/lib/account-type";

type ViewMode = "grid" | "list";
type Filter = "all" | "residential" | "commercial" | "attention";
type DrawerTab = "overview" | "ppm" | "compliance" | "documents" | "history";

export default function SitesPage() {
  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const openProp = useMemo(() => PROPERTIES.find((p) => p.id === openId), [openId]);

  const filtered = PROPERTIES.filter((p) => {
    if (filter === "residential") return !p.commercial;
    if (filter === "commercial") return p.commercial;
    if (filter === "attention") return p.rag !== "ok";
    return true;
  });

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

      <div className="tbar" style={{ border: "1px solid var(--ln)", borderRadius: 6, marginBottom: 14 }}>
        <div className="srch">
          <span style={{ fontSize: 13, color: "var(--s50)" }}>⌕</span>
          <input placeholder={`Search ${t("sitesPageTitle").toLowerCase()}…`} />
        </div>
        {(["all", "residential", "commercial", "attention"] as Filter[]).map((f) => (
          <span key={f} className={`fc${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "attention" ? "Needs attention" : f.charAt(0).toUpperCase() + f.slice(1)}
          </span>
        ))}
      </div>

      {view === "grid" ? (
        <div className="prop-grid">
          {filtered.map((p) => (
            <div key={p.id} className="prop-card-g" onClick={() => setOpenId(p.id)}>
              <div className="img">
                <PropScene scene={p.img.scene} palette={p.img.palette} />
                <span className={`rag ${p.rag}`}>{p.rag === "ok" ? "Compliant" : p.rag === "w" ? "Attention" : "Action"}</span>
                <div className="ov">
                  <span className="tg">{p.type}</span>
                  {p.commercial && <span className="tg">Commercial</span>}
                </div>
              </div>
              <div className="body">
                <div className="name">{p.name}</div>
                <div className="addr">{p.addr} · {p.branch}</div>
                <div className="stats">
                  <div className="stat">
                    <div className="v">{p.ppm.length}</div>
                    <div className="l">{t("ppm")}</div>
                  </div>
                  <div className="stat">
                    <div className="v">{p.certs.length}</div>
                    <div className="l">Certs</div>
                  </div>
                  <div className="stat">
                    <div className="v">{p.jobs}</div>
                    <div className="l">Open jobs</div>
                  </div>
                  <div className="stat">
                    <div className="v">{p.docs.length}</div>
                    <div className="l">Docs</div>
                  </div>
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
                <th>Branch</th>
                <th>Compliance</th>
                <th>Open jobs</th>
                <th>Certs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setOpenId(p.id)}>
                  <td>
                    <div className="b">{p.name}</div>
                    <div className="mu mono">{p.addr}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{p.type}</td>
                  <td style={{ fontSize: 12 }}>{p.branch}</td>
                  <td className="b mono">{p.compl}%</td>
                  <td className="b mono">{p.jobs}</td>
                  <td className="b mono">{p.certs.length}</td>
                  <td>
                    <span className={`pill ${p.rag === "ok" ? "ok" : p.rag === "w" ? "w" : "r"}`}>
                      <span className="d" />
                      {p.rag === "ok" ? "Compliant" : p.rag === "w" ? "Attention" : "Action"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openProp && <PropertyDrawer prop={openProp} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function PropertyDrawer({ prop, onClose }: { prop: MockProperty; onClose: () => void }) {
  const [tab, setTab] = useState<DrawerTab>("overview");

  return (
    <Drawer open={true} onClose={onClose}>
      <DrawerHeader
        title={prop.name}
        meta={`${prop.addr} · ${prop.branch}`}
        onClose={onClose}
      />
      <div style={{ padding: "0 20px" }}>
        <DrawerTabs
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "ppm", label: t("ppm"), count: prop.ppm.length },
            { id: "compliance", label: "Compliance", count: prop.certs.length },
            { id: "documents", label: "Documents", count: prop.docs.length },
            { id: "history", label: "Job history" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <DrawerBody>
        {tab === "overview" && (
          <>
            <div
              style={{
                aspectRatio: "16/7",
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
                marginBottom: 14,
              }}
            >
              <PropScene scene={prop.img.scene} palette={prop.img.palette} />
            </div>
            <div className="kg">
              <div className="kpi">
                <div className="lbl">Compliance</div>
                <div className="val">{prop.compl}%</div>
                <div className="tr flat">{prop.rag === "ok" ? "Healthy" : "Needs attention"}</div>
              </div>
              <div className="kpi">
                <div className="lbl">Open jobs</div>
                <div className="val">{prop.jobs}</div>
                <div className="tr flat">Active</div>
              </div>
              <div className="kpi">
                <div className="lbl">{t("ppm")}</div>
                <div className="val">{prop.ppm.length}</div>
                <div className="tr flat">Scheduled</div>
              </div>
            </div>
            <div className="blk" style={{ marginTop: 12 }}>
              <div className="bh"><h3>Active {t("ppm").toLowerCase()}</h3></div>
              <div className="bb">
                {prop.ppm.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--ln)",
                    }}
                  >
                    <div>
                      <div className="bold">{p.name}</div>
                      <div className="mu mono">{p.svc} · Next {p.next}</div>
                    </div>
                    <span className="ppm-card">
                      <span className="freq">{p.freq}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "ppm" && (
          <>
            {prop.ppm.map((p) => (
              <div key={p.id} className="ppm-card" style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="bold">{p.name}</div>
                    <div className="mu mono">{p.id} · Next: {p.next}</div>
                  </div>
                  <span className="freq">{p.freq}</span>
                </div>
              </div>
            ))}
            <button className="btn btn-g btn-sm">+ Add plan</button>
          </>
        )}

        {tab === "compliance" && (
          <table className="tbl">
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Expiry</th>
                <th>Days left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prop.certs.map((c, i) => (
                <tr key={i}>
                  <td className="b">{c.n}</td>
                  <td className="mono mu">{c.exp}</td>
                  <td className="mono b">{c.daysLeft}d</td>
                  <td>
                    <span className={`pill ${c.status}`}>
                      <span className="d" />
                      {c.status === "ok" ? "Compliant" : c.status === "w" ? "Expiring" : "Action"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "documents" && (
          <div className="blk">
            {prop.docs.map((d, i) => (
              <div key={i} className="doc-row">
                <div className={`doc-ic ${d.enc ? "enc" : d.type}`}>{d.type.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div className="bold">{d.n}</div>
                  <div className="mu mono">
                    {d.tag} · {d.size} {d.enc && "· encrypted"}
                  </div>
                </div>
                <button className="btn btn-g btn-sm">↓</button>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div className="empty">
            <div className="ic-lg">📜</div>
            <div className="t">Job history filtered to this {t("sitesSingular")}</div>
            <div className="s">See the History page for full records.</div>
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
