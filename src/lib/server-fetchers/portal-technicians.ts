import { getServerSupabase } from "@/lib/supabase/server-cached";

export interface PortalTechnicianPin {
  user_id:    string;
  latitude:   number;
  longitude:  number;
  accuracy:   number | null;
  job_id:     string | null;
  job_title:  string | null;
  partner_name: string | null;
  updated_at: string;
}

const ACTIVE_JOB_STATUSES = [
  "in_progress_phase1",
  "in_progress_phase2",
  "in_progress_phase3",
  "final_check",
];

/**
 * Returns initial map pins for technicians actively working on jobs
 * for this account. The portal subscribes to user_locations realtime
 * after this initial load to update the same pins as engineers move.
 *
 * Steps:
 *   1. Find active jobs in this account → resolve their partner_id.
 *   2. Map partner_id → partners.auth_user_id (the user shipping
 *      locations from the mobile app).
 *   3. Pull the most recent user_locations row per user_id.
 */
export async function fetchPortalTechnicians(accountId: string): Promise<PortalTechnicianPin[]> {
  const supabase = await getServerSupabase();

  // 1. clients in this account
  const { data: clientRows } = await supabase
    .from("clients")
    .select("id")
    .eq("source_account_id", accountId)
    .is("deleted_at", null)
    .limit(1000);
  const clientIds = ((clientRows ?? []) as Array<{ id: string }>).map((c) => c.id);
  if (clientIds.length === 0) return [];

  // 2. active jobs + their partner_id + title
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, partner_id")
    .in("client_id", clientIds)
    .in("status", ACTIVE_JOB_STATUSES)
    .is("deleted_at", null)
    .limit(200);
  const jobRows = ((jobs ?? []) as Array<{ id: string; title: string; partner_id: string | null }>);
  const partnerIds = jobRows.map((j) => j.partner_id).filter((id): id is string => id != null);
  if (partnerIds.length === 0) return [];

  // 3. partner → auth_user_id mapping
  const { data: partners } = await supabase
    .from("partners")
    .select("id, auth_user_id, company_name")
    .in("id", partnerIds);
  const partnerMap = new Map<string, { auth_user_id: string | null; name: string }>();
  for (const p of (partners ?? []) as Array<{ id: string; auth_user_id: string | null; company_name: string }>) {
    partnerMap.set(p.id, { auth_user_id: p.auth_user_id, name: p.company_name });
  }

  // Build user_id list (only partners with auth_user_id are tracked).
  const userIdToPartnerJob = new Map<string, { jobId: string; jobTitle: string; partnerName: string }>();
  for (const j of jobRows) {
    if (!j.partner_id) continue;
    const p = partnerMap.get(j.partner_id);
    if (!p?.auth_user_id) continue;
    userIdToPartnerJob.set(p.auth_user_id, { jobId: j.id, jobTitle: j.title, partnerName: p.name });
  }
  const userIds = Array.from(userIdToPartnerJob.keys());
  if (userIds.length === 0) return [];

  // 4. latest active location per user
  const { data: locs } = await supabase
    .from("user_locations")
    .select("user_id, latitude, longitude, accuracy, created_at")
    .in("user_id", userIds)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);

  const latest = new Map<string, { lat: number; lng: number; acc: number | null; ts: string }>();
  for (const l of (locs ?? []) as Array<{ user_id: string; latitude: number; longitude: number; accuracy: number | null; created_at: string }>) {
    if (latest.has(l.user_id)) continue; // already kept the newest
    latest.set(l.user_id, {
      lat: l.latitude,
      lng: l.longitude,
      acc: l.accuracy,
      ts:  l.created_at,
    });
  }

  return Array.from(latest.entries()).map(([userId, p]) => {
    const meta = userIdToPartnerJob.get(userId)!;
    return {
      user_id:      userId,
      latitude:     p.lat,
      longitude:    p.lng,
      accuracy:     p.acc,
      job_id:       meta.jobId,
      job_title:    meta.jobTitle,
      partner_name: meta.partnerName,
      updated_at:   p.ts,
    };
  });
}
