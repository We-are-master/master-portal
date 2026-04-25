import { Suspense } from "react";
import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountQuotes } from "@/lib/server-fetchers/portal-quotes";
import { fetchAccountRequests } from "@/lib/server-fetchers/portal-requests";
import { RequestsClient } from "./requests-client";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const auth = await requirePortalUserOrRedirect();
  const [requests, quotes] = await Promise.all([
    fetchAccountRequests(auth.accountId),
    fetchAccountQuotes(auth.accountId),
  ]);
  return (
    <Suspense fallback={null}>
      <RequestsClient requests={requests} quotes={quotes} />
    </Suspense>
  );
}
