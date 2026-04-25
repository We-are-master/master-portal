import { getServerSupabase } from "@/lib/supabase/server-cached";

export interface SpendByService {
  service_name: string;
  total_spend:  number;
  job_count:    number;
}

/**
 * Calls the get_account_spend_by_service RPC (mig 157) which sums
 * jobs.client_price grouped by service catalog name over the last
 * `periodDays` days. Bounded to 12 service categories.
 */
export async function fetchAccountSpendByService(
  accountId: string,
  periodDays = 30,
): Promise<SpendByService[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc("get_account_spend_by_service", {
    p_account_id:  accountId,
    p_period_days: periodDays,
  });
  if (error || !data) return [];
  return data as SpendByService[];
}
