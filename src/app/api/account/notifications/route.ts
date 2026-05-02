import { NextRequest, NextResponse } from "next/server";
import { logPortalAudit } from "@/lib/portal-audit";
import { requirePortalUser } from "@/lib/portal-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set<string>([
  "quote_submitted", "compliance_due", "job_overdue",
  "invoice_issued", "weekly_digest", "sla_breach",
  "finance_alert", "tenant_message", "ticket_reply",
]);

const ALLOWED_CHANNELS = new Set<string>(["email", "push", "sms", "in_app"]);

/**
 * POST /api/account/notifications
 * Body: {
 *   notification_type: string,
 *   channel:           string,
 *   enabled:           boolean,
 *   scope?:            "user" | "account"   // default "user"
 * }
 *
 * Upserts a notification preference. scope=user binds the row to the
 * caller; scope=account leaves portal_user_id NULL (account-wide
 * default; only admins should use this in practice — RLS allows it
 * for any portal user but we'll enforce admin-only in a follow-up).
 */
export async function POST(req: NextRequest) {
  const auth = await requirePortalUser();
  if (auth instanceof NextResponse) return auth;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`portal-notif-pref:${auth.user.id}:${ip}`, 60, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: { notification_type?: unknown; channel?: unknown; enabled?: unknown; scope?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const t  = String(body.notification_type ?? "");
  const ch = String(body.channel           ?? "");
  const en = Boolean(body.enabled);
  const scope = body.scope === "account" ? "account" : "user";

  if (!ALLOWED_TYPES.has(t)) {
    return NextResponse.json({ error: "Invalid notification_type" }, { status: 400 });
  }
  if (!ALLOWED_CHANNELS.has(ch)) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  }

  const portalUserId: string | null = scope === "user" ? auth.portalUser.id : null;
  const admin = createServiceClient();

  // Upsert path: try update first, insert if 0 rows affected. We use
  // service_role to avoid the RLS round-trip; the tenant filter is
  // enforced by the WHERE.
  const filter: Record<string, unknown> = {
    account_id:        auth.accountId,
    notification_type: t,
    channel:           ch,
  };
  if (portalUserId) filter.portal_user_id = portalUserId;
  // If portalUserId is null we want the account-wide default row;
  // PostgREST `is` for NULL.
  let updateBuilder = admin
    .from("account_notification_preferences")
    .update({ enabled: en, updated_at: new Date().toISOString() })
    .match({
      account_id:        auth.accountId,
      notification_type: t,
      channel:           ch,
    });
  updateBuilder = portalUserId
    ? updateBuilder.eq("portal_user_id", portalUserId)
    : updateBuilder.is("portal_user_id", null);

  const { error: updateErr, data: updatedRows } = await updateBuilder.select("id");
  if (updateErr) {
    console.error("[portal/account/notifications] update failed:", updateErr);
    return NextResponse.json({ error: "Could not save preference" }, { status: 500 });
  }

  const updatedCount = (updatedRows ?? []).length;
  if (updatedCount === 0) {
    const { error: insertErr } = await admin
      .from("account_notification_preferences")
      .insert({
        account_id:        auth.accountId,
        portal_user_id:    portalUserId,
        notification_type: t,
        channel:           ch,
        enabled:           en,
      });
    if (insertErr) {
      console.error("[portal/account/notifications] insert failed:", insertErr);
      return NextResponse.json({ error: "Could not save preference" }, { status: 500 });
    }
  }

  void logPortalAudit({
    entityType: "account",
    entityId:   auth.accountId,
    action:     "updated",
    userId:     auth.portalUser.id,
    userName:   auth.portalUser.full_name ?? auth.portalUser.email,
    fieldName:  `notif:${t}:${ch}`,
    newValue:   String(en),
    metadata:   { scope, notification_type: t, channel: ch },
  });

  return NextResponse.json({ ok: true });
}
