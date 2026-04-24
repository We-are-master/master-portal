/**
 * Next.js instrumentation entry (Next 15+). Runs once at server startup
 * per runtime (node / edge) — wire Sentry up here so it captures errors
 * even from server components and middleware.
 *
 * The Sentry webpack plugin (configured via withSentryConfig in
 * next.config.ts) dynamically loads the right sentry.*.config.ts file
 * based on which runtime is booting.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Captures uncaught exceptions that bubble to the React server-component
 * boundary. Gives Sentry the rich server context that the default
 * client-side onerror can't see.
 */
export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: { [key: string]: string | string[] | undefined } },
  context: { routerKind: "Pages Router" | "App Router"; routePath: string; routeType: "render" | "route" | "action" | "middleware" },
) {
  const { captureRequestError } = await import("@sentry/nextjs");
  captureRequestError(err, request, context);
}
