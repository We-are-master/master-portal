"use client";

import { useState } from "react";
import { Drawer, DrawerBody, DrawerHeader, DrawerTabs } from "./drawer";
import { MapPlaceholder } from "./map-placeholder";
import { ProgressBar } from "./progress-bar";
import { JOBS_ALL, type JobStatus } from "@/lib/mocks/portal-v2";

interface JobDrawerProps {
  jobId: string | null;
  onClose: () => void;
}

type DrawerTabId = "overview" | "report";

function bigPill(status: JobStatus) {
  if (status === "in_progress") return { cls: "c lg", label: "In Progress" };
  if (status === "awaiting_report") return { cls: "w lg", label: "Awaiting Report" };
  if (status === "upcoming") return { cls: "b lg", label: "Upcoming" };
  if (status === "completed") return { cls: "ok lg", label: "Done" };
  return { cls: "r lg", label: "Cancelled" };
}

export function JobDrawer({ jobId, onClose }: JobDrawerProps) {
  const job = jobId ? JOBS_ALL.find((j) => j.id === jobId) : null;
  const [tab, setTab] = useState<DrawerTabId>("overview");
  const [open, setOpen] = useState({ start: true, photos: true, work: false, finish: false, completion: false });

  if (!job) return <Drawer open={false} onClose={onClose}>{null}</Drawer>;

  const isLive = job.status === "in_progress";
  const pill = bigPill(job.status);
  const toggleSection = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  return (
    <Drawer open={true} onClose={onClose}>
      <DrawerHeader
        title={
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className={`pill ${pill.cls}`}>
                <span className="d" />
                {pill.label}
              </span>
              <span className="pill n">{job.svc}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--s50)" }}>{job.id}</span>
            </div>
            {job.title}
          </>
        }
        meta={`${job.site} · ${job.addr}`}
        onClose={onClose}
      />
      <div style={{ padding: "0 20px" }}>
        <DrawerTabs
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "report", label: "Report" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <DrawerBody>
        {tab === "overview" && (
          <>
            <ProgressBar status={job.status} />

            {isLive && (
              <div
                style={{
                  background: "rgba(234,76,11,.07)",
                  border: "1px solid rgba(234,76,11,.2)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--co)",
                    animation: "pulse 1s infinite",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Job started 14:30 · {job.tech} on site</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--co)", marginTop: 2 }}>
                    Timer: 00:52:14 elapsed · SLA: {job.sla} remaining
                  </div>
                </div>
              </div>
            )}

            <div className="s12" style={{ marginBottom: 14 }}>
              <div className="blk" style={{ padding: 14 }}>
                <div className="kk" style={{ marginBottom: 8 }}>Job details</div>
                <div className="inf">
                  <span className="k">Service</span><span className="bold">{job.svc}</span>
                  <span className="k">Technician</span><span>{job.tech}</span>
                  <span className="k">Site</span><span>{job.site}</span>
                  <span className="k">Address</span><span className="mono" style={{ fontSize: 11 }}>{job.addr}</span>
                  <span className="k">Date</span><span>{job.date}</span>
                  <span className="k">Value</span><span className="bold mono">{job.value}</span>
                  <span className="k">SLA</span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      color: job.slaPct < 50 ? "var(--rd)" : job.slaPct < 75 ? "var(--am)" : "var(--gr)",
                    }}
                  >
                    {job.sla}
                  </span>
                </div>
              </div>
              <MapPlaceholder height={220} techLive={isLive} />
            </div>

            <div className="blk" style={{ padding: 14 }}>
              <div className="kk" style={{ marginBottom: 10 }}>Timeline</div>
              <div className="tl">
                {[
                  { h: "Request received", m: "22 Apr · 11:04", b: "Logged via portal", done: true },
                  { h: "Quoted & approved", m: "22 Apr · 12:41", b: `${job.value} approved`, done: true },
                  { h: "Technician assigned", m: "22 Apr · 13:32", b: `${job.tech} · confirmed`, done: true },
                  {
                    h: "On site",
                    m: isLive
                      ? "Today · 14:30 — live"
                      : job.status === "awaiting_report" || job.status === "completed"
                      ? "Completed"
                      : "Scheduled",
                    b: isLive ? "GPS tracking active" : "",
                    done: job.status === "awaiting_report" || job.status === "completed",
                    now: isLive,
                  },
                  {
                    h: "Report & sign-off",
                    m: job.status === "completed" ? "Done" : "Pending",
                    b: "Photos + completion required",
                    done: job.status === "completed",
                  },
                  { h: "Invoice issued", m: job.status === "completed" ? "Invoice raised" : "Pending" },
                ].map((it, i) => (
                  <div key={i} className="tli">
                    <div className={`tld${it.done ? " done" : it.now ? " now" : ""}`} />
                    <div className="tlh">{it.h}</div>
                    <div className="tlm">{it.m}</div>
                    {it.b && <div className="tlb">{it.b}</div>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "report" && (
          job.status === "completed" || job.status === "awaiting_report" ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="kk">Completion report · {job.id}</div>
                <button className="btn btn-n btn-sm">↓ Download PDF</button>
              </div>
              {[
                {
                  k: "start" as const,
                  title: "Start & scope",
                  content: (
                    <div className="fr">
                      <div>
                        <div className="kk">Start time</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 500 }}>09:28</div>
                      </div>
                      <div>
                        <div className="kk">Scope change</div>
                        <div style={{ color: "var(--gr)", fontWeight: 500 }}>No change</div>
                      </div>
                    </div>
                  ),
                },
                {
                  k: "photos" as const,
                  title: "Before photos",
                  content: (
                    <div className="ph-grid">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="ph-slot"
                          style={{
                            background: "linear-gradient(135deg,#c8d0e0,#a0b0c8)",
                            fontSize: 10,
                            color: "rgba(255,255,255,.8)",
                          }}
                        >
                          IMG_{2480 + i}
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  k: "work" as const,
                  title: "Work completed",
                  content: (
                    <>
                      <p style={{ fontSize: 13, color: "var(--s70)", lineHeight: 1.6 }}>
                        Worcester Greenstar 30si pressure restored. Expansion vessel replaced. System flushed and
                        re-pressurised to 1.5 bar. All radiators tested. No further issues found.
                      </p>
                      <div className="fr mt8">
                        <div>
                          <div className="kk">Materials</div>
                          <div style={{ fontSize: 12 }}>Expansion vessel, sealant</div>
                        </div>
                        <div>
                          <div className="kk">Duration</div>
                          <div style={{ fontFamily: "var(--mono)", fontWeight: 500 }}>2h 14m</div>
                        </div>
                      </div>
                    </>
                  ),
                },
                {
                  k: "finish" as const,
                  title: "After photos",
                  content: (
                    <div className="ph-grid">
                      {[5, 6, 7, 8].map((i) => (
                        <div
                          key={i}
                          className="ph-slot"
                          style={{
                            background: "linear-gradient(135deg,#b8d0c0,#90b8a0)",
                            fontSize: 10,
                            color: "rgba(255,255,255,.8)",
                          }}
                        >
                          IMG_{2480 + i}
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  k: "completion" as const,
                  title: "Completion & feedback",
                  content: (
                    <>
                      <div className="fr">
                        <div>
                          <div className="kk">Status</div>
                          <span className="pill ok">✓ Completed</span>
                        </div>
                        <div>
                          <div className="kk">Follow-up</div>
                          <div style={{ color: "var(--gr)", fontSize: 12 }}>Not required</div>
                        </div>
                      </div>
                      <div className="mt8">
                        <div className="kk">Client feedback</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>😊 Good — job done quickly and tidily</div>
                      </div>
                    </>
                  ),
                },
              ].map((sec) => (
                <div key={sec.k} className="rs">
                  <div className="coll-hdr" onClick={() => toggleSection(sec.k)}>
                    <h4>{sec.title}</h4>
                    <span>{open[sec.k] ? "▲" : "▼"}</span>
                  </div>
                  {open[sec.k] && <div className="coll-body">{sec.content}</div>}
                </div>
              ))}
            </>
          ) : (
            <div className="empty">
              <div className="ic-lg">🕓</div>
              <div className="t">Report not yet available</div>
              <div className="s">Completion report appears once the job is done</div>
            </div>
          )
        )}
      </DrawerBody>
    </Drawer>
  );
}
