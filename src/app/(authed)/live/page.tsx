import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchLiveViewCalendar } from "@/lib/server-fetchers/portal-live-view";
import { LiveViewClient } from "./live-view-client";

export const dynamic = "force-dynamic";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function LiveViewPage() {
  const auth = await requirePortalUserOrRedirect();

  // 30-day window starting from today.
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 29);

  const events = await fetchLiveViewCalendar(auth.accountId, isoDate(start), isoDate(end));
  return <LiveViewClient events={events} fromDate={isoDate(start)} />;
}
