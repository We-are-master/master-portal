import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountCompliance } from "@/lib/server-fetchers/portal-compliance";
import { fetchPortalPpmPlans } from "@/lib/server-fetchers/portal-ppm";
import { fetchAccountProperties } from "@/lib/server-fetchers/portal-properties";
import { SitesClient } from "./sites-client";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const auth = await requirePortalUserOrRedirect();
  const [properties, compliance, ppm] = await Promise.all([
    fetchAccountProperties(auth.accountId),
    fetchAccountCompliance(auth.accountId),
    fetchPortalPpmPlans(auth.accountId),
  ]);
  return <SitesClient properties={properties} compliance={compliance} ppm={ppm} />;
}
