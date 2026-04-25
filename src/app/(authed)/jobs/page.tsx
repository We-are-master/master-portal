import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountJobs } from "@/lib/server-fetchers/portal-jobs";
import { JobsClient } from "./jobs-client";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const auth = await requirePortalUserOrRedirect();
  const { items } = await fetchAccountJobs(auth.accountId);
  return <JobsClient jobs={items} />;
}
