import { getServerSupabase } from "@/lib/supabase/server-cached";
import type { PortalJobRow } from "./portal-jobs";

export interface PortalPropertyDocument {
  id:            string;
  property_id:   string;
  file_name:     string;
  storage_path:  string;
  document_type: string;
  size_bytes:    number | null;
  created_at:    string;
  uploaded_by:   string | null;
}

/**
 * Returns every property document for an account in one round-trip,
 * pre-joined with property_id so the UI can group by property in
 * memory. Bounded at 1000.
 */
export async function fetchAccountPropertyDocuments(accountId: string): Promise<PortalPropertyDocument[]> {
  const supabase = await getServerSupabase();

  const { data: props } = await supabase
    .from("account_properties")
    .select("id")
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .limit(500);
  const propIds = ((props ?? []) as Array<{ id: string }>).map((p) => p.id);
  if (propIds.length === 0) return [];

  const { data, error } = await supabase
    .from("account_property_documents")
    .select("id, property_id, file_name, storage_path, document_type, size_bytes, created_at, uploaded_by")
    .in("property_id", propIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) return [];
  return data as PortalPropertyDocument[];
}

/**
 * Documents attached to a single property. RLS scoped via mig 138's
 * policies (account_property_documents inherits the property's
 * account_id).
 */
export async function fetchPropertyDocuments(
  propertyId: string,
  accountId: string,
): Promise<PortalPropertyDocument[]> {
  const supabase = await getServerSupabase();

  // Belt + braces: confirm the property belongs to this account before
  // returning. Cheaper than relying purely on RLS for cross-account
  // safety.
  const { data: prop } = await supabase
    .from("account_properties")
    .select("id")
    .eq("id", propertyId)
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!prop) return [];

  const { data, error } = await supabase
    .from("account_property_documents")
    .select("id, property_id, file_name, storage_path, document_type, size_bytes, created_at, uploaded_by")
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data as PortalPropertyDocument[];
}

/**
 * Jobs linked to a single property (joined through clients →
 * source_account_id for the cross-account guard). Reuses the same
 * select shape as fetchAccountJobs so the UI can share row renderers.
 */
export async function fetchPropertyJobs(
  propertyId: string,
  accountId: string,
): Promise<PortalJobRow[]> {
  const supabase = await getServerSupabase();

  const { data: prop } = await supabase
    .from("account_properties")
    .select("id")
    .eq("id", propertyId)
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!prop) return [];

  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id, reference, title, status, scheduled_date, scheduled_start_at,
      property_id, property_address, partner_name, current_phase,
      total_phases, created_at
    `)
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data as PortalJobRow[];
}
