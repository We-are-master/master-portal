import { getServerSupabase } from "@/lib/supabase/server-cached";

export interface PortalAccountUser {
  id:                string;
  email:             string;
  full_name:         string | null;
  is_active:         boolean;
  invited_by:        string | null;
  last_signed_in_at: string | null;
  created_at:        string;
}

/**
 * Returns every portal user attached to an account. Used by the
 * Settings → Users & Access tab. RLS scoped via mig 149.
 */
export async function fetchAccountPortalUsers(accountId: string): Promise<PortalAccountUser[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("account_portal_users")
    .select("id, email, full_name, is_active, invited_by, last_signed_in_at, created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error || !data) return [];
  return data as PortalAccountUser[];
}
