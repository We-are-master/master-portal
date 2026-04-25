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

const SELECT_COLS =
  "id, property_id, certificate_type, issued_date, expiry_date, status, document_path, notes, last_checked_at";

/**
 * Compute days_left in JS from expiry_date. Postgres rejects
 * `GENERATED ALWAYS AS (expiry_date - CURRENT_DATE) STORED` because
 * CURRENT_DATE is STABLE not IMMUTABLE — and a STORED value would
 * freeze at insert time. So we do the subtraction here on each read.
 */
function withDaysLeft(row: Omit<PortalComplianceCert, "days_left">): PortalComplianceCert {
  const expiry = new Date(`${row.expiry_date}T00:00:00`);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs   = expiry.getTime() - today.getTime();
  const days_left = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return { ...row, days_left };
}

/**
 * Returns every active compliance certificate for an account, ordered
 * by soonest-to-expire. Bounded at 500. RLS scoped via mig 155.
 */
export async function fetchAccountCompliance(accountId: string): Promise<PortalComplianceCert[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("account_compliance_certificates")
    .select(SELECT_COLS)
    .eq("account_id", accountId)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true })
    .limit(500);

  if (error || !data) return [];
  return (data as Array<Omit<PortalComplianceCert, "days_left">>).map(withDaysLeft);
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
    .select(SELECT_COLS)
    .eq("account_id", accountId)
    .eq("property_id", propertyId)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true })
    .limit(100);

  if (error || !data) return [];
  return (data as Array<Omit<PortalComplianceCert, "days_left">>).map(withDaysLeft);
}
