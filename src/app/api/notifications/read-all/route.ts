import { NextRequest, NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/portal-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/read-all
 * Marks every unread notification for this portal user as read.
 */
export async function POST(req: NextRequest) {
  const auth = await requirePortalUser();
  if (auth instanceof NextResponse) return auth;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`portal-notif-readall:${auth.user.id}:${ip}`, 10, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const admin = createServiceClient();
  const { error } = await admin
    .from("portal_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("account_id", auth.accountId)
    .or(`portal_user_id.is.null,portal_user_id.eq.${auth.user.id}`)
    .is("read_at", null);
  if (error) {
    console.error("[portal/notifications/read-all]", error);
    return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
