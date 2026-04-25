import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountJobs } from "@/lib/server-fetchers/portal-jobs";
import { fetchAccountQuotes } from "@/lib/server-fetchers/portal-quotes";
import { HistoryClient } from "./history-client";

export const dynamic = "force-dynamic";

const HISTORICAL_JOB_STATUSES = ["completed", "cancelled", "invoiced", "no_action", "closed"];
const HISTORICAL_QUOTE_STATUSES = ["accepted", "rejected", "converted_to_job"];

export default async function HistoryPage() {
  const auth = await requirePortalUserOrRedirect();
  const [allJobs, allQuotes] = await Promise.all([
    fetchAccountJobs(auth.accountId),
    fetchAccountQuotes(auth.accountId),
  ]);

  const jobs   = allJobs.filter((j)   => HISTORICAL_JOB_STATUSES.includes(j.status));
  const quotes = allQuotes.filter((q) => HISTORICAL_QUOTE_STATUSES.includes(q.status));

  return <HistoryClient jobs={jobs} quotes={quotes} />;
}
