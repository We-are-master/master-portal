import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Supabase + Sentry origins need to be reachable for connect-src / img-src.
// Read from env so deploy-time config (dev vs staging vs prod) can differ.
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

// Sentry ingest — tunnelRoute keeps browser traffic same-origin, but
// allow the EU ingest host in CSP as a fallback for cases where the
// tunnel is disabled or the SDK posts directly from a preview build.
const sentryIngest = "https://*.ingest.de.sentry.io";

const connectSrc = [
  "'self'",
  "https:",           // covers Resend/Stripe/other cross-origin fetch tags
  "wss:",             // Supabase realtime
  ...(supabaseUrl ? [supabaseUrl] : []),
  sentryIngest,
].join(" ");

// `script-src 'self' 'unsafe-inline' 'unsafe-eval'` keeps Next's hydration
// and dev-mode HMR working. A stricter nonce-based policy is a follow-up
// once we confirm nothing breaks (Next supports it natively via middleware).
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "https://js.stripe.com",
].join(" ");

const csp = [
  `default-src 'self'`,
  `script-src ${scriptSrc}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src ${connectSrc}`,
  `frame-src 'self' https://js.stripe.com https://hooks.stripe.com`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(projectRoot),
  },
  compress: true,
  modularizeImports: {
    "date-fns": {
      transform: "date-fns/{{member}}",
      preventFullImport: true,
    },
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

// ---------------------------------------------------------------------------
// Sentry wrapping. No-ops cleanly when SENTRY_DSN is unset (e.g. local
// dev without a Sentry project). The plugin still runs so source-map
// upload to Sentry happens during CI builds where SENTRY_AUTH_TOKEN is
// set.
// ---------------------------------------------------------------------------
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Don't break builds if Sentry is misconfigured in dev/preview.
  silent: !process.env.CI,

  // Upload source maps only when we have credentials (typically CI prod
  // builds). Avoids noisy warnings on every local `next build`.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Route browser error reports through /monitoring so adblockers don't
  // strip them (Sentry's default ingest domain is widely blocked).
  tunnelRoute: "/monitoring",
});
