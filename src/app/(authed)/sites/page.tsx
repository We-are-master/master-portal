import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountCompliance } from "@/lib/server-fetchers/portal-compliance";
import { fetchAccountJobs } from "@/lib/server-fetchers/portal-jobs";
import { fetchPortalPpmPlans } from "@/lib/server-fetchers/portal-ppm";
import { fetchAccountProperties } from "@/lib/server-fetchers/portal-properties";
import { fetchAccountPropertyDocuments } from "@/lib/server-fetchers/portal-property-detail";
import { SitesClient } from "./sites-client";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const auth = await requirePortalUserOrRedirect();
  const [properties, compliance, ppm, documents, jobsPage] = await Promise.all([
    fetchAccountProperties(auth.accountId),
    fetchAccountCompliance(auth.accountId),
    fetchPortalPpmPlans(auth.accountId),
    fetchAccountPropertyDocuments(auth.accountId),
    fetchAccountJobs(auth.accountId),
  ]);
  return (
    <SitesClient
      properties={properties}
      compliance={compliance}
      ppm={ppm}
      documents={documents}
      jobs={jobsPage.items}
    />
  );
}
