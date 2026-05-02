import { getServerSupabase } from "@/lib/supabase/server-cached";
import { clampPageSize, decodeCursor, nextCursorFrom, type Page } from "./cursor";

export interface PortalListOpts {
  cursor?: string;
  limit?:  number;
}

export interface PortalJobRow {
  id:               string;
  reference:        string;
  title:            string;
  status:           string;
  scheduled_date:   string | null;
  scheduled_start_at: string | null;
  property_id:      string | null;
  property_address: string | null;
  partner_name:     string | null;
  current_phase:    number | null;
  total_phases:     number | null;
  created_at:       string;
}

export interface PortalJobDetail extends PortalJobRow {
  scope:        string | null;
  client_price: number;
}

/**
 * Returns one page of jobs for an account, ordered by most recent first.
 * Keyset pagination on (created_at DESC, id DESC).
 */
export async function fetchAccountJobs(
  accountId: string,
  opts: PortalListOpts = {},
): Promise<Page<PortalJobRow>> {
  const supabase = await getServerSupabase();
  const limit  = clampPageSize(opts.limit);
  const cursor = decodeCursor(opts.cursor);

  const { data: clientRows } = await supabase
    .from("clients")
    .select("id")
    .eq("source_account_id", accountId)
    .is("deleted_at", null)
    .limit(1000);
  const clientIds = ((clientRows ?? []) as Array<{ id: string }>).map((c) => c.id);
  if (clientIds.length === 0) return { items: [], nextCursor: null };

  let query = supabase
    .from("jobs")
    .select(`
      id, reference, title, status, scheduled_date, scheduled_start_at,
      property_id, property_address, partner_name, current_phase,
      total_phases, created_at
    `)
    .in("client_id", clientIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.value},and(created_at.eq.${cursor.value},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error || !data) return { items: [], nextCursor: null };
  const items = data as PortalJobRow[];
  return { items, nextCursor: nextCursorFrom(items, "created_at", limit) };
}

/**
 * Loads a single job scoped to an account. Returns null on missing or
 * cross-account access.
 */
export async function fetchPortalJobDetail(
  jobId: string,
  accountId: string,
): Promise<PortalJobDetail | null> {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("jobs")
    .select(`
      id, reference, title, status, scheduled_date, scheduled_start_at,
      property_id, property_address, partner_name, current_phase,
      total_phases, scope, client_price, client_id, created_at
    `)
    .eq("id", jobId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) return null;
  const j = data as Record<string, unknown>;

  const clientId = j.client_id as string | null;
  if (!clientId) return null;
  const { data: client } = await supabase
    .from("clients")
    .select("source_account_id")
    .eq("id", clientId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!client || (client as { source_account_id?: string }).source_account_id !== accountId) {
    return null;
  }

  return {
    id:                 j.id as string,
    reference:          (j.reference as string) ?? "",
    title:              (j.title as string) ?? "Job",
    status:             (j.status as string) ?? "",
    scheduled_date:     (j.scheduled_date as string | null) ?? null,
    scheduled_start_at: (j.scheduled_start_at as string | null) ?? null,
    property_id:        (j.property_id as string | null) ?? null,
    property_address:   (j.property_address as string | null) ?? null,
    partner_name:       (j.partner_name as string | null) ?? null,
    current_phase:      (j.current_phase as number | null) ?? null,
    total_phases:       (j.total_phases as number | null) ?? null,
    scope:              (j.scope as string | null) ?? null,
    client_price:       Number(j.client_price ?? 0),
    created_at:         (j.created_at as string) ?? "",
  };
}
