"use client";

import { useMemo, useState } from "react";
import { MapPlaceholder } from "@/components/portal/map-placeholder";
import type { LiveCalendarEvent } from "@/lib/server-fetchers/portal-live-view";

type Tab = "schedule" | "map";

interface Props {
  events:   LiveCalendarEvent[];
  fromDate: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function eventCls(ev: LiveCalendarEvent): string {
  if (ev.cls === "job")        return "job";
  if (ev.cls === "ppm")        return "ppm";
  if (ev.cls === "compliance") return "rec";
  return "req";
}

export function LiveViewClient({ events, fromDate }: Props) {
  const [tab, setTab] = useState<Tab>("schedule");

  const start = useMemo(() => new Date(`${fromDate}T00:00:00`), [fromDate]);

  // Build 7 × 5 = 35-cell grid that begins on the Monday of the start week.
  const cells = useMemo(() => {
    const dayOfWeek = (start.getDay() + 6) % 7; // Mon=0
    const gridStart = new Date(start.getTime() - dayOfWeek * DAY_MS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: Array<{ day: number; iso: string; dim: boolean; today: boolean }> = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(gridStart.getTime() + i * DAY_MS);
      const iso = d.toISOString().slice(0, 10);
      out.push({
        day:    d.getDate(),
        iso,
        dim:    d < start || d >= new Date(start.getTime() + 30 * DAY_MS),
        today:  d.getTime() === today.getTime(),
      });
    }
    return out;
  }, [start]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, LiveCalendarEvent[]>();
    for (const e of events) {
      const list = m.get(e.date) ?? [];
      list.push(e);
      m.set(e.date, list);
    }
    return m;
  }, [events]);

  const counts = {
    job:        events.filter((e) => e.cls === "job").length,
    ppm:        events.filter((e) => e.cls === "ppm").length,
    compliance: events.filter((e) => e.cls === "compliance").length,
  };

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Live View</h1>
          <p className="sub">30-day schedule across your portfolio. Jobs, PPM visits and compliance expiries in one view.</p>
        </div>
        <div className="acts">
          <button className="btn btn-g btn-sm">Export</button>
        </div>
      </div>

      <div className="ptabs">
        <div className={`ptab${tab === "schedule" ? " on" : ""}`} onClick={() => setTab("schedule")}>
          Schedule <span className="ct">{events.length}</span>
        </div>
        <div className={`ptab${tab === "map" ? " on" : ""}`} onClick={() => setTab("map")}>
          Live map
        </div>
      </div>

      {tab === "schedule" && (
        <>
          <div className="cal">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="cal-h">{d}</div>
            ))}
            {cells.map((c, i) => {
              const dayEvents = eventsByDate.get(c.iso) ?? [];
              return (
                <div key={i} className={`cal-d${c.dim ? " dim" : ""}${c.today ? " today" : ""}`}>
                  <div className={`cal-dn${c.today ? " t" : ""}`}>
                    <span>{c.day}</span>
                  </div>
                  {dayEvents.slice(0, 4).map((e) => (
                    <div key={e.id} className={`cal-ev ${eventCls(e)}`} title={e.title}>
                      <span className="el">{e.label}</span>
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 4 && (
                    <div style={{ fontSize: 9, color: "var(--s50)", marginTop: 2 }}>
                      +{dayEvents.length - 4} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { c: "job", l: `Jobs (${counts.job})` },
              { c: "ppm", l: `PPM visits (${counts.ppm})` },
              { c: "rec", l: `Compliance expiries (${counts.compliance})` },
            ].map((lg) => (
              <div key={lg.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--s70)" }}>
                <span className={`cal-ev ${lg.c}`} style={{ padding: "2px 6px", margin: 0, fontSize: 10 }}>■</span>
                {lg.l}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "map" && (
        <div className="blk">
          <div className="bh"><h3>Engineers on site</h3></div>
          <MapPlaceholder height={520} />
          <div className="bb">
            <p style={{ fontSize: 12, color: "var(--s50)" }}>
              Live technician location ships in the next release — wiring Supabase realtime to user_locations
              with per-account scoping.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
