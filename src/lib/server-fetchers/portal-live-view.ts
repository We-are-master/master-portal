import { getServerSupabase } from "@/lib/supabase/server-cached";

export type LiveEventClass = "job" | "ppm" | "compliance";

export interface LiveCalendarEvent {
  id:        string;
  date:      string; // ISO yyyy-MM-dd
  cls:       LiveEventClass;
  label:     string; // short tag shown in the cell
  title:     string; // longer text
  reference: string | null;
  property:  string | null;
}

/**
 * Combines jobs + PPM plans + compliance certificates into a single
 * day-keyed event list for the Live View calendar. Range is inclusive
 * on both ends; pass ISO date strings (yyyy-MM-dd).
 *
 * Heavy lifting (per-account scoping) lives in the underlying tables'
 * RLS policies; this fetcher just JOINs and shapes.
 */
export async function fetchLiveViewCalendar(
  accountId: string,
  fromDate: string,
  toDate: string,
): Promise<LiveCalendarEvent[]> {
  const supabase = await getServerSupabase();

  // Resolve the client ids (jobs scope) up front.
  const { data: clientRows } = await supabase
    .from("clients")
    .select("id")
    .eq("source_account_id", accountId)
    .is("deleted_at", null)
    .limit(1000);
  const clientIds = ((clientRows ?? []) as Array<{ id: string }>).map((c) => c.id);

  const [jobsRes, ppmRes, certRes, propsRes] = await Promise.all([
    clientIds.length > 0
      ? supabase
          .from("jobs")
          .select("id, reference, title, scheduled_date, property_id, property_address")
          .in("client_id", clientIds)
          .is("deleted_at", null)
          .gte("scheduled_date", fromDate)
          .lte("scheduled_date", toDate)
          .limit(500)
      : Promise.resolve({ data: [] as Array<{ id: string; reference: string; title: string; scheduled_date: string; property_id: string | null; property_address: string | null }> }),

    supabase
      .from("account_ppm_plans")
      .select("id, name, next_visit_date, property_id")
      .eq("account_id", accountId)
      .eq("status", "active")
      .is("deleted_at", null)
      .gte("next_visit_date", fromDate)
      .lte("next_visit_date", toDate)
      .limit(500),

    supabase
      .from("account_compliance_certificates")
      .select("id, certificate_type, expiry_date, property_id")
      .eq("account_id", accountId)
      .is("deleted_at", null)
      .gte("expiry_date", fromDate)
      .lte("expiry_date", toDate)
      .limit(500),

    supabase
      .from("account_properties")
      .select("id, name")
      .eq("account_id", accountId)
      .is("deleted_at", null)
      .limit(500),
  ]);

  const propMap = new Map<string, string>();
  for (const p of (propsRes.data ?? []) as Array<{ id: string; name: string }>) {
    propMap.set(p.id, p.name);
  }

  const events: LiveCalendarEvent[] = [];

  for (const j of (jobsRes.data ?? []) as Array<{
    id: string; reference: string; title: string; scheduled_date: string;
    property_id: string | null; property_address: string | null;
  }>) {
    events.push({
      id:        `job:${j.id}`,
      date:      j.scheduled_date,
      cls:       "job",
      label:     "JOB",
      title:     j.title ?? j.reference,
      reference: j.reference,
      property:  j.property_id ? (propMap.get(j.property_id) ?? null) : (j.property_address ?? null),
    });
  }

  for (const p of (ppmRes.data ?? []) as Array<{
    id: string; name: string; next_visit_date: string | null; property_id: string | null;
  }>) {
    if (!p.next_visit_date) continue;
    events.push({
      id:        `ppm:${p.id}`,
      date:      p.next_visit_date,
      cls:       "ppm",
      label:     "PPM",
      title:     p.name,
      reference: null,
      property:  p.property_id ? (propMap.get(p.property_id) ?? null) : null,
    });
  }

  for (const c of (certRes.data ?? []) as Array<{
    id: string; certificate_type: string; expiry_date: string; property_id: string | null;
  }>) {
    events.push({
      id:        `cert:${c.id}`,
      date:      c.expiry_date,
      cls:       "compliance",
      label:     "CERT",
      title:     `${c.certificate_type.replace(/_/g, " ").toUpperCase()} expires`,
      reference: null,
      property:  c.property_id ? (propMap.get(c.property_id) ?? null) : null,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
