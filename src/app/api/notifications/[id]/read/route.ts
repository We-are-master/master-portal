import { NextRequest, NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/portal-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/auth-api";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/[id]/read
 * Marks a single notification as read. Idempotent.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requirePortalUser();
  if (auth instanceof NextResponse) return auth;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`portal-notif-read:${auth.user.id}:${ip}`, 30, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const admin = createServiceClient();
  const { error } = await admin
    .from("portal_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("account_id", auth.accountId)
    .is("read_at", null);
  if (error) {
    console.error("[portal/notifications/read]", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
