/**
 * Sentry server-side init. Runs in Node server runtime (API routes,
 * server components, RSC fetches). Controlled by SENTRY_DSN.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",

    // Server-side tracing is more valuable than client-side (APIs, DB calls),
    // so we sample higher.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

    sendDefaultPii: false,

    ignoreErrors: [
      // Supabase realtime often surfaces benign disconnect noise.
      /Connection closed/,
      /AbortError/,
    ],
  });
}
