import { getServerSupabase } from "@/lib/supabase/server-cached";

export interface PortalPropertyRow {
  id:               string;
  name:             string;
  full_address:     string;
  property_type:    string;
  primary_contact_id: string | null;
  primary_contact_name: string | null;
  phone:            string | null;
  active_jobs:      number;
  created_at:       string;
}

/**
 * Returns properties for an account along with a count of currently-open
 * jobs per property. Bounded at 200 — partition into pages once portal
 * UI grows past that. Fields like `branch`, `property_code` and
 * compliance status arrive in the mig 154/155 follow-up; portal pages
 * should treat them as optional today.
 */
export async function fetchAccountProperties(accountId: string): Promise<PortalPropertyRow[]> {
  const supabase = await getServerSupabase();

  const { data: rawProps, error } = await supabase
    .from("account_properties")
    .select(`
      id, name, full_address, property_type,
      primary_contact_id, phone, created_at
    `)
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .order("name", { ascending: true })
    .limit(200);

  if (error || !rawProps) return [];
  const props = rawProps as Array<{
    id: string; name: string; full_address: string; property_type: string;
    primary_contact_id: string | null; phone: string | null; created_at: string;
  }>;
  if (props.length === 0) return [];

  // Resolve primary contact names + count of open jobs in parallel.
  const contactIds = props
    .map((p) => p.primary_contact_id)
    .filter((id): id is string => id != null);

  const [contactRes, jobRes] = await Promise.all([
    contactIds.length > 0
      ? supabase
          .from("clients")
          .select("id, full_name")
          .in("id", contactIds)
          .limit(200)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string }> }),
    supabase
      .from("jobs")
      .select("id, property_id, status")
      .in("property_id", props.map((p) => p.id))
      .is("deleted_at", null)
      .not(
        "status",
        "in",
        "(completed,cancelled,invoiced,no_action,closed)",
      )
      .limit(2000),
  ]);

  const contactMap = new Map<string, string>();
  for (const c of (contactRes.data ?? []) as Array<{ id: string; full_name: string }>) {
    contactMap.set(c.id, c.full_name);
  }

  const jobCount = new Map<string, number>();
  for (const j of (jobRes.data ?? []) as Array<{ property_id: string }>) {
    jobCount.set(j.property_id, (jobCount.get(j.property_id) ?? 0) + 1);
  }

  return props.map((p) => ({
    id:                   p.id,
    name:                 p.name,
    full_address:         p.full_address,
    property_type:        p.property_type,
    primary_contact_id:   p.primary_contact_id,
    primary_contact_name: p.primary_contact_id ? (contactMap.get(p.primary_contact_id) ?? null) : null,
    phone:                p.phone,
    active_jobs:          jobCount.get(p.id) ?? 0,
    created_at:           p.created_at,
  }));
}
