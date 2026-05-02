/**
 * Sentry client-side init. Runs in the browser bundle.
 * Controlled by NEXT_PUBLIC_SENTRY_DSN — unset = SDK no-ops cleanly.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development",

    // Performance — keep modest on the client to avoid bundle + quota blow-up.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session replay — disabled by default; turn on deliberately when
    // investigating a specific bug.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

    // Scrub anything that looks like a JWT, magic-link token or email body.
    sendDefaultPii: false,

    // Filter noise — browser extensions, canceled fetches, network hiccups.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "AbortError: The user aborted a request.",
      /^Load failed$/,
      /^NetworkError/,
    ],
  });
}
