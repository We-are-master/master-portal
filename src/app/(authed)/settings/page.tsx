import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import {
  fetchAccountSettings,
  fetchNotificationPreferences,
} from "@/lib/server-fetchers/portal-settings";
import { fetchPortalAccount } from "@/lib/server-fetchers/portal-account";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const auth = await requirePortalUserOrRedirect();
  const [account, settings, prefs] = await Promise.all([
    fetchPortalAccount(auth.accountId),
    fetchAccountSettings(auth.accountId),
    fetchNotificationPreferences(auth.accountId, auth.portalUser.id),
  ]);
  return (
    <SettingsClient
      account={account}
      settings={settings}
      prefs={prefs}
    />
  );
}
