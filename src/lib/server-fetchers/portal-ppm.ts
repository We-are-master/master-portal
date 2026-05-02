import { getServerSupabase } from "@/lib/supabase/server-cached";

export interface PortalPpmPlan {
  id:                  string;
  property_id:         string | null;
  catalog_service_id:  string | null;
  service_name:        string | null;
  name:                string;
  frequency:           string;
  frequency_days:      number | null;
  next_visit_date:     string | null;
  last_visit_date:     string | null;
  status:              string;
}

/**
 * Returns active PPM plans for an account. Joins service_catalog so the
 * UI can render a service name without a second round-trip.
 */
export async function fetchPortalPpmPlans(accountId: string): Promise<PortalPpmPlan[]> {
  const supabase = await getServerSupabase();
  const { data: plans, error } = await supabase
    .from("account_ppm_plans")
    .select("id, property_id, catalog_service_id, name, frequency, frequency_days, next_visit_date, last_visit_date, status")
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .order("next_visit_date", { ascending: true, nullsFirst: false })
    .limit(500);

  if (error || !plans) return [];
  const rows = plans as Array<Omit<PortalPpmPlan, "service_name">>;

  const svcIds = rows.map((p) => p.catalog_service_id).filter((id): id is string => id != null);
  let svcMap = new Map<string, string>();
  if (svcIds.length > 0) {
    const { data: svc } = await supabase
      .from("service_catalog")
      .select("id, name")
      .in("id", svcIds)
      .limit(200);
    for (const s of (svc ?? []) as Array<{ id: string; name: string }>) {
      svcMap.set(s.id, s.name);
    }
  }

  return rows.map((p) => ({
    ...p,
    service_name: p.catalog_service_id ? (svcMap.get(p.catalog_service_id) ?? null) : null,
  }));
}

export async function fetchPropertyPpm(
  propertyId: string,
  accountId: string,
): Promise<PortalPpmPlan[]> {
  const all = await fetchPortalPpmPlans(accountId);
  return all.filter((p) => p.property_id === propertyId);
}
