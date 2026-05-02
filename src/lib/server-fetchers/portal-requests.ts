import { getServerSupabase } from "@/lib/supabase/server-cached";
import { clampPageSize, decodeCursor, nextCursorFrom, type Page } from "./cursor";

export interface PortalListOpts {
  cursor?: string;
  limit?:  number;
}

export interface PortalRequestRow {
  id:               string;
  reference:        string;
  service_type:     string;
  status:           string;
  description:      string | null;
  property_address: string | null;
  owner_name:       string | null;
  created_at:       string;
}

/**
 * Returns one page of service requests for an account, scoped through
 * the clients.source_account_id FK chain. Keyset pagination on
 * (created_at DESC, id DESC).
 */
export async function fetchAccountRequests(
  accountId: string,
  opts: PortalListOpts = {},
): Promise<Page<PortalRequestRow>> {
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
    .from("service_requests")
    .select("id, reference, service_type, status, description, property_address, owner_name, created_at")
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
  const items = data as PortalRequestRow[];
  return { items, nextCursor: nextCursorFrom(items, "created_at", limit) };
}
