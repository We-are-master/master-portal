import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountJobs, type PortalJobRow } from "@/lib/server-fetchers/portal-jobs";
import { JobsClient } from "./jobs-client";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const auth = await requirePortalUserOrRedirect();
  const jobs: PortalJobRow[] = await fetchAccountJobs(auth.accountId);
  return <JobsClient jobs={jobs} />;
}
