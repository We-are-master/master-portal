import { getServerSupabase } from "@/lib/supabase/server-cached";

export interface PortalAccountSettingsRow {
  account_id:                 string;
  legal_name:                 string | null;
  vat_percentage:             number;
  currency:                   string;
  default_payment_terms_days: number;
  accent_colour:              string | null;
  logo_url:                   string | null;
  updated_at:                 string;
}

export interface PortalNotificationPref {
  id:                string;
  account_id:        string;
  portal_user_id:    string | null;
  notification_type: string;
  channel:           string;
  enabled:           boolean;
  updated_at:        string;
}

export async function fetchAccountSettings(accountId: string): Promise<PortalAccountSettingsRow | null> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("account_settings")
    .select("account_id, legal_name, vat_percentage, currency, default_payment_terms_days, accent_colour, logo_url, updated_at")
    .eq("account_id", accountId)
    .maybeSingle();
  if (error || !data) return null;
  return data as PortalAccountSettingsRow;
}

/**
 * Returns notification prefs for the account: account-wide defaults
 * (portal_user_id IS NULL) merged with this user's overrides.
 *
 * The merge contract: if a user-specific row exists for a given
 * (type, channel) pair, it overrides the account-wide default. Caller
 * receives at most one row per (type, channel).
 */
export async function fetchNotificationPreferences(
  accountId: string,
  portalUserId: string,
): Promise<PortalNotificationPref[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("account_notification_preferences")
    .select("id, account_id, portal_user_id, notification_type, channel, enabled, updated_at")
    .eq("account_id", accountId)
    .or(`portal_user_id.is.null,portal_user_id.eq.${portalUserId}`)
    .limit(500);
  if (error || !data) return [];

  const rows = data as PortalNotificationPref[];
  // User-specific wins. Build a map keyed by (type, channel).
  const merged = new Map<string, PortalNotificationPref>();
  for (const r of rows) {
    const k = `${r.notification_type}::${r.channel}`;
    const existing = merged.get(k);
    if (!existing) merged.set(k, r);
    else if (existing.portal_user_id === null && r.portal_user_id != null) {
      merged.set(k, r);
    }
  }
  return [...merged.values()];
}
