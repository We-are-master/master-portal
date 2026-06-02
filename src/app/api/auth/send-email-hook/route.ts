import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/send-email-hook
 *
 * Supabase Auth "Send Email Hook". Self-hosted GoTrue POSTs here every time it
 * needs to deliver an auth email (magic link / OTP login, recovery, invite,
 * email change, signup confirm). We render the email ourselves and send it via
 * Resend instead of relying on GoTrue's built-in SMTP.
 *
 * Configure on the GoTrue (Supabase) side:
 *   GOTRUE_HOOK_SEND_EMAIL_ENABLED=true
 *   GOTRUE_HOOK_SEND_EMAIL_URI=https://portal.getfixfy.com/api/auth/send-email-hook
 *   GOTRUE_HOOK_SEND_EMAIL_SECRETS=<same value as SEND_EMAIL_HOOK_SECRET>
 *
 * The request is signed using the Standard Webhooks spec; we verify it with the
 * shared secret before trusting any payload.
 */

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type:
    | "signup"
    | "magiclink"
    | "recovery"
    | "invite"
    | "email_change"
    | "email"
    | string;
  site_url: string;
  token_new?: string;
  token_hash_new?: string;
}

interface HookPayload {
  user: { email: string; [k: string]: unknown };
  email_data: EmailData;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const NAVY = "#0B1F3A";
const CORAL = "#EA4C0B";

/** Build the Supabase verify link that the magic-link button points to. */
function buildVerifyUrl(d: EmailData): string {
  const base = d.site_url.replace(/\/$/, "");
  const params = new URLSearchParams({
    token: d.token_hash,
    type: d.email_action_type,
    redirect_to: d.redirect_to,
  });
  return `${base}/auth/v1/verify?${params.toString()}`;
}

function renderEmail(d: EmailData): { subject: string; html: string } {
  const verifyUrl = buildVerifyUrl(d);
  const code = escapeHtml(d.token);

  const copy: Record<string, { subject: string; heading: string; intro: string; cta: string }> = {
    magiclink: {
      subject: "Your Fixfy sign-in code",
      heading: "Sign in to Fixfy",
      intro: "Use the code below to sign in to your Fixfy portal, or tap the button.",
      cta: "Sign in to Fixfy",
    },
    email: {
      subject: "Your Fixfy sign-in code",
      heading: "Sign in to Fixfy",
      intro: "Use the code below to sign in to your Fixfy portal, or tap the button.",
      cta: "Sign in to Fixfy",
    },
    signup: {
      subject: "Confirm your Fixfy account",
      heading: "Confirm your account",
      intro: "Use the code below to confirm your Fixfy account, or tap the button.",
      cta: "Confirm account",
    },
    recovery: {
      subject: "Reset your Fixfy password",
      heading: "Reset your password",
      intro: "Use the code below to reset your password, or tap the button.",
      cta: "Reset password",
    },
    invite: {
      subject: "You've been invited to Fixfy",
      heading: "You've been invited",
      intro: "Use the code below to accept your invitation, or tap the button.",
      cta: "Accept invite",
    },
    email_change: {
      subject: "Confirm your new email",
      heading: "Confirm your email change",
      intro: "Use the code below to confirm your new email address, or tap the button.",
      cta: "Confirm email",
    },
  };

  const c = copy[d.email_action_type] ?? copy.magiclink;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
      <div style="margin-bottom:28px">
        <strong style="font-size:20px;color:${NAVY};letter-spacing:-0.5px">Fixfy</strong>
      </div>
      <h1 style="font-size:22px;margin:0 0 8px;color:${NAVY}">${c.heading}</h1>
      <p style="color:#64748b;margin:0 0 24px;line-height:1.5;font-size:15px">${c.intro}</p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;text-align:center;margin:0 0 24px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px">Your code</div>
        <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:${NAVY};font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${code}</div>
      </div>

      <a href="${escapeHtml(verifyUrl)}"
         style="display:inline-block;background:${CORAL};color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">
        ${c.cta}
      </a>

      <p style="color:#94a3b8;font-size:12px;margin:32px 0 0;line-height:1.5">
        This code expires shortly. If you didn&rsquo;t request this, you can safely ignore this email.
      </p>
    </div>
  `;

  return { subject: c.subject, html };
}

export async function POST(req: NextRequest) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "Fixfy <noreply@getfixfy.com>";

  if (!secret) {
    console.error("[auth/send-email-hook] SEND_EMAIL_HOOK_SECRET not set");
    return NextResponse.json({ error: "Hook not configured" }, { status: 500 });
  }
  if (!resendKey || resendKey.startsWith("re_YOUR_")) {
    console.error("[auth/send-email-hook] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const raw = await req.text();

  // Standard Webhooks verification — the secret may carry the "v1,whsec_"
  // prefix; the library wants the bare base64 portion.
  let payload: HookPayload;
  try {
    const wh = new Webhook(secret.replace(/^v1,whsec_/, ""));
    const headers = {
      "webhook-id": req.headers.get("webhook-id") ?? "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": req.headers.get("webhook-signature") ?? "",
    };
    payload = wh.verify(raw, headers) as HookPayload;
  } catch (err) {
    console.error("[auth/send-email-hook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const to = payload.user?.email;
  if (!to) {
    return NextResponse.json({ error: "No recipient" }, { status: 400 });
  }

  const { subject, html } = renderEmail(payload.email_data);

  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({ from: fromEmail, to, subject, html });
    if (error) {
      console.error("[auth/send-email-hook] resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
    }
  } catch (err) {
    console.error("[auth/send-email-hook] unexpected send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  // GoTrue treats a 200 with empty/{} body as success.
  return NextResponse.json({});
}
