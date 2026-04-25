import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountProperties } from "@/lib/server-fetchers/portal-properties";
import { SitesClient } from "./sites-client";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const auth = await requirePortalUserOrRedirect();
  const properties = await fetchAccountProperties(auth.accountId);
  return <SitesClient properties={properties} />;
}
