import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/portal-auth";
import { fetchPortalQuoteDetail } from "@/lib/server-fetchers/portal-quotes";

export const dynamic = "force-dynamic";

/**
 * GET /api/quotes/[id]
 * Returns the full quote detail (including line_items) for the
 * caller's account. 404 on cross-account or missing — never reveals
 * existence.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requirePortalUser();
  if (auth instanceof NextResponse) return auth;

  const { id } = await ctx.params;
  const quote = await fetchPortalQuoteDetail(id, auth.accountId);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  return NextResponse.json({ quote });
}
