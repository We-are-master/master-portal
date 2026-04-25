import { Suspense } from "react";
import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountTickets } from "@/lib/server-fetchers/portal-tickets";
import { getServerSupabase } from "@/lib/supabase/server-cached";
import { TicketsClient, type PortalTicketRow } from "./tickets-client";

export const dynamic = "force-dynamic";

export default async function PortalTicketsPage() {
  const auth    = await requirePortalUserOrRedirect();
  const supabase = await getServerSupabase();

  const [ticketsPage, clientRowsRes] = await Promise.all([
    // First page only — the keyset-cursor API on fetchAccountTickets is
    // already in place for "Load more" UX in a follow-up PR (needs a
    // new /api/tickets/list endpoint + client-side append).
    fetchAccountTickets(auth.accountId, { limit: 100 }),
    supabase
      .from("clients")
      .select("id")
      .eq("source_account_id", auth.accountId)
      .is("deleted_at", null)
      .limit(1000),
  ]);

  const clientIds = (clientRowsRes.data ?? []).map((c: { id: string }) => c.id);
  let jobs: Array<{ id: string; reference: string; title: string }> = [];
  if (clientIds.length > 0) {
    const { data } = await supabase
      .from("jobs")
      .select("id, reference, title")
      .in("client_id", clientIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);
    jobs = (data ?? []) as Array<{ id: string; reference: string; title: string }>;
  }

  return (
    <Suspense fallback={null}>
      <TicketsClient tickets={ticketsPage.items as PortalTicketRow[]} jobs={jobs} />
    </Suspense>
  );
}
