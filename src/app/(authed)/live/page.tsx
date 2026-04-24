"use client";

import { useState } from "react";
import { MapPlaceholder } from "@/components/portal/map-placeholder";

type Tab = "schedule" | "map";

interface CalEvent {
  lbl: string;
  t: string;
  site?: string;
  cls: "ok" | "ppm" | "job" | "req" | "rec";
}

const EVENTS: Record<number, CalEvent[]> = {
  21: [{ lbl: "JOB", t: "EOT Clean · 09:00", site: "18 Crawford St", cls: "ok" }],
  22: [{ lbl: "PPM", t: "Boiler service · 10:00", site: "Flat 4", cls: "ppm" }],
  23: [
    { lbl: "LIVE", t: "Boiler fault · 14:30", site: "Flat 4", cls: "job" },
    { lbl: "REQ", t: "EICR quote in", cls: "req" },
  ],
  24: [{ lbl: "PPM", t: "HVAC filter · 08:00", site: "14 Exmouth", cls: "ppm" }],
  25: [
    { lbl: "REC", t: "Weekly clean · 06:00", cls: "rec" },
    { lbl: "JOB", t: "Double glazing · 09:00", cls: "job" },
  ],
  28: [{ lbl: "REC", t: "Weekly clean · 06:00", cls: "rec" }],
  29: [{ lbl: "PPM", t: "Gas safety · 11:00", site: "Flat 4", cls: "ppm" }],
  30: [{ lbl: "REC", t: "Gutter clearance", cls: "rec" }],
  4: [{ lbl: "PPM", t: "Quarterly deep clean", site: "42 Upper St", cls: "ppm" }],
  6: [{ lbl: "REC", t: "Weekly clean · 06:00", cls: "rec" }],
  12: [{ lbl: "REC", t: "Weekly clean · 06:00", cls: "rec" }],
};

const TODAY = 23;

function calendarCells() {
  const cells: { day: number; dim: boolean; today: boolean }[] = [];
  for (let d = 21; d <= 30; d++) cells.push({ day: d, dim: false, today: d === TODAY });
  for (let d = 1; d <= 20; d++) cells.push({ day: d, dim: true, today: false });
  return cells;
}

export default function LiveViewPage() {
  const [tab, setTab] = useState<Tab>("schedule");
  const cells = calendarCells();

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Live View</h1>
          <p className="sub">30-day schedule + real-time map of engineers on site across your portfolio.</p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">Export</button>
        </div>
      </div>

      <div className="ptabs">
        <div className={`ptab${tab === "schedule" ? " on" : ""}`} onClick={() => setTab("schedule")}>
          Schedule <span className="ct">30d</span>
        </div>
        <div className={`ptab${tab === "map" ? " on" : ""}`} onClick={() => setTab("map")}>
          Live map <span className="ct">3</span>
        </div>
      </div>

      {tab === "schedule" && (
        <>
          <div className="cal">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="cal-h">{d}</div>
            ))}
            {cells.map((c, i) => (
              <div key={i} className={`cal-d${c.dim ? " dim" : ""}${c.today ? " today" : ""}`}>
                <div className={`cal-dn${c.today ? " t" : ""}`}>
                  <span>{c.day}</span>
                </div>
                {(EVENTS[c.day] ?? []).map((e, j) => (
                  <div key={j} className={`cal-ev ${e.cls}`}>
                    <span className="el">{e.lbl}</span>
                    {e.t}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { c: "ppm", l: "PPM" },
              { c: "ok", l: "Completed" },
              { c: "job", l: "Live / job" },
              { c: "req", l: "Request / quote" },
              { c: "rec", l: "Recurring" },
            ].map((lg) => (
              <div key={lg.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--s70)" }}>
                <span
                  className={`cal-ev ${lg.c}`}
                  style={{ padding: "2px 6px", margin: 0, fontSize: 10 }}
                >
                  ■
                </span>
                {lg.l}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "map" && (
        <div className="blk">
          <div className="bh"><h3>Engineers on site</h3></div>
          <MapPlaceholder height={520} techLive pinCount={4} />
        </div>
      )}
    </div>
  );
}
