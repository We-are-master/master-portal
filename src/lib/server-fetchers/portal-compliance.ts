import { getServerSupabase } from "@/lib/supabase/server-cached";

export interface PortalComplianceCert {
  id:               string;
  property_id:      string | null;
  certificate_type: string;
  issued_date:      string | null;
  expiry_date:      string;
  days_left:        number;
  status:           "ok" | "expiring" | "expired" | "missing";
  document_path:    string | null;
  notes:            string | null;
  last_checked_at:  string | null;
}

/**
 * Returns every active compliance certificate for an account, ordered
 * by soonest-to-expire. Bounded at 500 — accounts with thousands of
 * properties should add filtering in a follow-up. Read via mig 155
 * RLS (`account_id = current_portal_account_id()`).
 */
export async function fetchAccountCompliance(accountId: string): Promise<PortalComplianceCert[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("account_compliance_certificates")
    .select("id, property_id, certificate_type, issued_date, expiry_date, days_left, status, document_path, notes, last_checked_at")
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true })
    .limit(500);

  if (error || !data) return [];
  return data as PortalComplianceCert[];
}

/**
 * Same as fetchAccountCompliance but scoped to a single property.
 */
export async function fetchPropertyCompliance(
  propertyId: string,
  accountId: string,
): Promise<PortalComplianceCert[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("account_compliance_certificates")
    .select("id, property_id, certificate_type, issued_date, expiry_date, days_left, status, document_path, notes, last_checked_at")
    .eq("account_id", accountId)
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true })
    .limit(100);

  if (error || !data) return [];
  return data as PortalComplianceCert[];
}
