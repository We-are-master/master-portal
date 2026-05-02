"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPlaceholder } from "@/components/portal/map-placeholder";
import type { LiveCalendarEvent } from "@/lib/server-fetchers/portal-live-view";
import type { PortalTechnicianPin } from "@/lib/server-fetchers/portal-technicians";
import { createClient } from "@/lib/supabase/client";

type Tab = "schedule" | "map";

interface Props {
  events:      LiveCalendarEvent[];
  fromDate:    string;
  technicians: PortalTechnicianPin[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function eventCls(ev: LiveCalendarEvent): string {
  if (ev.cls === "job")        return "job";
  if (ev.cls === "ppm")        return "ppm";
  if (ev.cls === "compliance") return "rec";
  return "req";
}

function formatTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "Just now";
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

export function LiveViewClient({ events, fromDate, technicians: initial }: Props) {
  const [tab, setTab] = useState<Tab>("schedule");
  const [techs, setTechs] = useState<PortalTechnicianPin[]>(initial);

  // Realtime: subscribe to user_locations INSERT + UPDATE for the
  // technicians we already know about. RLS scopes the channel data
  // server-side, but we still defensively filter by user_id.
  useEffect(() => {
    if (initial.length === 0) return;
    const knownIds = new Set(initial.map((t) => t.user_id));
    const supabase = createClient();
    const channel = supabase
      .channel("portal-live-locations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_locations" },
        (payload) => {
          const r = payload.new as {
            user_id: string; latitude: number; longitude: number;
            accuracy: number | null; created_at: string; is_active: boolean;
          };
          if (!knownIds.has(r.user_id) || !r.is_active) return;
          setTechs((prev) =>
            prev.map((t) =>
              t.user_id === r.user_id
                ? { ...t, latitude: r.latitude, longitude: r.longitude, accuracy: r.accuracy, updated_at: r.created_at }
                : t,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [initial]);

  const start = useMemo(() => new Date(`${fromDate}T00:00:00`), [fromDate]);

  const cells = useMemo(() => {
    const dayOfWeek = (start.getDay() + 6) % 7;
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
          Live map <span className="ct">{techs.length}</span>
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
        <div className="s21">
          <div className="blk">
            <div className="bh">
              <h3>Engineers on site</h3>
              <span style={{ fontSize: 11, color: "var(--s50)" }}>
                Live · {techs.length} active
              </span>
            </div>
            <MapPlaceholder height={520} techLive={techs.length > 0} pinCount={Math.max(1, techs.length)} />
            <div className="bb">
              <p style={{ fontSize: 11, color: "var(--s50)" }}>
                Pin positions update in real time as engineers move. The
                visual map preview is a placeholder — Mapbox tiles ship
                with the next release.
              </p>
            </div>
          </div>

          <div className="blk">
            <div className="bh"><h3>Active engineers</h3></div>
            {techs.length === 0 ? (
              <div className="bb">
                <span style={{ fontSize: 12, color: "var(--s50)" }}>
                  No engineers currently on site.
                </span>
              </div>
            ) : (
              <div style={{ padding: 0 }}>
                {techs.map((t) => (
                  <div
                    key={t.user_id}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid var(--ln)",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div className="bold">{t.partner_name ?? "—"}</div>
                      <span className="pill ok"><span className="d" />Live</span>
                    </div>
                    <div className="mu mono" style={{ marginTop: 2 }}>
                      {t.job_title ?? "On a job"}
                    </div>
                    <div className="mu" style={{ marginTop: 4, fontSize: 11 }}>
                      {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)} · {formatTime(t.updated_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
