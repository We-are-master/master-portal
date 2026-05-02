import { NextRequest, NextResponse } from "next/server";
import { logPortalAudit } from "@/lib/portal-audit";
import { requirePortalUser } from "@/lib/portal-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const WRITABLE = new Set<string>([
  "legal_name",
  "vat_percentage",
  "currency",
  "default_payment_terms_days",
  "accent_colour",
]);

/**
 * PATCH /api/account/settings
 * Body: subset of { legal_name, vat_percentage, currency,
 *                   default_payment_terms_days, accent_colour }
 *
 * Updates the account_settings row owned by this portal user's account.
 * Field-level validation is intentionally permissive — backend RLS +
 * the WRITABLE allowlist below are the load-bearing checks.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requirePortalUser();
  if (auth instanceof NextResponse) return auth;

  const ip = getClientIp(req);
  const rl = checkRateLimit(`portal-settings-patch:${auth.user.id}:${ip}`, 20, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!WRITABLE.has(k)) continue;
    if (k === "vat_percentage" || k === "default_payment_terms_days") {
      const num = Number(v);
      if (!Number.isFinite(num) || num < 0) {
        return NextResponse.json({ error: `${k} must be a positive number` }, { status: 400 });
      }
      patch[k] = num;
    } else if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed.length > 200) {
        return NextResponse.json({ error: `${k} is too long` }, { status: 400 });
      }
      patch[k] = trimmed.length > 0 ? trimmed : null;
    } else if (v === null) {
      patch[k] = null;
    }
  }
  patch.updated_at = new Date().toISOString();

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { error } = await admin
    .from("account_settings")
    .update(patch)
    .eq("account_id", auth.accountId);

  if (error) {
    console.error("[portal/account/settings] update failed:", error);
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }

  void logPortalAudit({
    entityType: "account",
    entityId:   auth.accountId,
    action:     "updated",
    userId:     auth.portalUser.id,
    userName:   auth.portalUser.full_name ?? auth.portalUser.email,
    metadata:   { fields: Object.keys(patch).filter((k) => k !== "updated_at"), via: "settings" },
  });

  return NextResponse.json({ ok: true });
}
