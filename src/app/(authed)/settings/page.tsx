import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountPortalUsers } from "@/lib/server-fetchers/portal-account-users";
import {
  fetchAccountSettings,
  fetchNotificationPreferences,
} from "@/lib/server-fetchers/portal-settings";
import { fetchPortalAccount } from "@/lib/server-fetchers/portal-account";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const auth = await requirePortalUserOrRedirect();
  const [account, settings, prefs, users] = await Promise.all([
    fetchPortalAccount(auth.accountId),
    fetchAccountSettings(auth.accountId),
    fetchNotificationPreferences(auth.accountId, auth.portalUser.id),
    fetchAccountPortalUsers(auth.accountId),
  ]);
  return (
    <SettingsClient
      account={account}
      settings={settings}
      prefs={prefs}
      users={users}
      currentUserId={auth.portalUser.id}
    />
  );
}
