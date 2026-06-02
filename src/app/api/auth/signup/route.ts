import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const ALLOWED_ACCOUNT_TYPES = new Set(["real_estate", "franchise", "service", "enterprise"]);

interface SignupBody {
  account_type?:    unknown;
  company_name?:    unknown;
  contact_name?:    unknown;
  email?:           unknown;
  phone?:           unknown;
  address?:         unknown;
  estimated_sites?: unknown;
}

/**
 * POST /api/auth/signup
 * Public route — anyone can create an account. The flow:
 *
 *   1. Validate input (server-side defense over the client form).
 *   2. Insert a new row in `accounts` with the account_type set.
 *   3. Use the Supabase admin API to invite the user by email — this
 *      mints an auth.users row with raw_user_meta_data set to
 *      `{ user_type: 'account_portal', account_id, full_name }`,
 *      which fires the existing handle_new_account_portal_user
 *      trigger and creates the account_portal_users row.
 *   4. Email the magic link via Resend.
 *
 * Rate-limited 3 per IP per hour to defeat spam.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`portal-signup:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again in an hour." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: SignupBody;
  try {
    body = (await req.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const accountType    = String(body.account_type ?? "");
  const companyName    = String(body.company_name ?? "").trim();
  const contactName    = String(body.contact_name ?? "").trim();
  const email          = String(body.email        ?? "").trim().toLowerCase();
  const phone          = body.phone   ? String(body.phone).trim()   : null;
  const address        = String(body.address      ?? "").trim();
  const estimatedSites = body.estimated_sites ? String(body.estimated_sites).trim() : null;

  if (!ALLOWED_ACCOUNT_TYPES.has(accountType)) {
    return NextResponse.json({ error: "Pick a valid account type." }, { status: 400 });
  }
  if (companyName.length < 2 || companyName.length > 200) {
    return NextResponse.json({ error: "Company name must be 2–200 characters." }, { status: 400 });
  }
  if (contactName.length < 2 || contactName.length > 200) {
    return NextResponse.json({ error: "Full name must be 2–200 characters." }, { status: 400 });
  }
  if (!email.includes("@") || email.length < 5 || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (address.length < 4 || address.length > 500) {
    return NextResponse.json({ error: "Enter your registered address." }, { status: 400 });
  }

  const admin = createServiceClient();

  // Block sign-ups for emails that already have a portal account so we
  // don't silently re-issue magic links to a different account row.
  const { data: existing } = await admin
    .from("account_portal_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      {
        error:
          "An account with that email already exists. Sign in instead.",
        existing: true,
      },
      { status: 409 },
    );
  }

  // 1. Create the accounts row first.
  const { data: account, error: accountErr } = await admin
    .from("accounts")
    .insert({
      company_name:    companyName,
      contact_name:    contactName,
      email,
      contact_number:  phone,
      address,
      account_type:    accountType,
      // Sensible defaults; staff can refine later.
      industry:        accountType === "real_estate" ? "real_estate" : "general",
      payment_terms:   "30",
      // Free-form note carries the estimated_sites + signup origin so
      // staff sees context in the activity feed.
      notes:           estimatedSites
        ? `Signed up via portal. Estimated sites: ${estimatedSites}.`
        : "Signed up via portal.",
    })
    .select("id, company_name")
    .single();

  if (accountErr || !account) {
    console.error("[portal/signup] account insert failed:", accountErr);
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 },
    );
  }

  const accountId = (account as { id: string }).id;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "") ||
    "http://localhost:3000";

  // 2. Invite the user by email. The trigger handle_new_account_portal_user
  //    (mig 131/132) creates the account_portal_users row from the metadata.
  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      user_type: "account_portal",
      account_id: accountId,
      full_name: contactName,
    },
    redirectTo: `${appUrl}/auth/callback`,
  });

  if (inviteErr) {
    // Roll back the accounts row so a retry succeeds (best-effort —
    // RLS on accounts via service role is bypassed, but a failed
    // delete still leaves stale data; user-facing error is the same).
    void admin.from("accounts").delete().eq("id", accountId);
    console.error("[portal/signup] invite failed:", inviteErr);
    return NextResponse.json(
      { error: "Could not send your magic link. Try a different email or contact support." },
      { status: 500 },
    );
  }

  // 3. Defensive: if the trigger swallowed an error (mig 132 wraps
  //    inserts in EXCEPTION), make sure account_portal_users has a
  //    row so the user can sign in. ON CONFLICT DO NOTHING means
  //    re-running is safe.
  const { data: authUser } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const userRow = authUser?.users?.find((u) => u.email?.toLowerCase() === email);
  if (userRow) {
    void admin.from("account_portal_users").upsert(
      {
        id:         userRow.id,
        account_id: accountId,
        email,
        full_name:  contactName,
        is_active:  true,
      },
      { onConflict: "id" },
    );
  }

  // 4. Internal notification (best-effort).
  void (async () => {
    try {
      const resendKey = process.env.RESEND_API_KEY?.trim();
      if (!resendKey) return;
      const resend = new Resend(resendKey);
      const fromEmail =
        process.env.RESEND_FROM_EMAIL?.trim() ||
        "Master Group <hello@wearemaster.com>";
      await resend.emails.send({
        from: fromEmail,
        to:   ["hello@wearemaster.com"],
        subject: `New portal signup: ${companyName} (${accountType})`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;padding:20px">
            <h1 style="font-size:18px;margin:0 0 8px">New portal signup</h1>
            <p style="color:#475569;margin:0 0 16px">A new account just signed up via /signup.</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#64748b;width:140px">Account type</td><td style="padding:6px 0">${accountType}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b">Company</td><td style="padding:6px 0;font-weight:600">${escapeHtml(companyName)}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b">Contact</td><td style="padding:6px 0">${escapeHtml(contactName)} · ${escapeHtml(email)}</td></tr>
              ${phone ? `<tr><td style="padding:6px 0;color:#64748b">Phone</td><td style="padding:6px 0">${escapeHtml(phone)}</td></tr>` : ""}
              <tr><td style="padding:6px 0;color:#64748b">Address</td><td style="padding:6px 0">${escapeHtml(address)}</td></tr>
              ${estimatedSites ? `<tr><td style="padding:6px 0;color:#64748b">Estimated sites</td><td style="padding:6px 0">${escapeHtml(estimatedSites)}</td></tr>` : ""}
            </table>
          </div>
        `,
      });
    } catch (err) {
      console.error("[portal/signup] internal notification email failed:", err);
    }
  })();

  return NextResponse.json({ ok: true, account_id: accountId });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
