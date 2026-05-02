/**
 * Keyset cursor helpers for portal list fetchers.
 *
 * We paginate by the (orderValue, id) pair rather than offset so the
 * cost stays O(log n) regardless of how deep into the list a user
 * scrolls. Encoded as opaque base64-url JSON so the client never reads
 * or constructs cursor values.
 *
 * Convention:
 *   - `value` is the order column (`created_at` or `updated_at`).
 *   - `id`    breaks ties when two rows share the same timestamp.
 *   - Order is DESC on both, so the next page's predicate is
 *     `(value, id) < (cursor.value, cursor.id)`.
 */

export interface CursorPayload {
  value: string;
  id: string;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

const PAGE_DEFAULT = 50;
const PAGE_MAX     = 200;

export function clampPageSize(input: number | undefined): number {
  if (!input || !Number.isFinite(input) || input <= 0) return PAGE_DEFAULT;
  return Math.min(Math.floor(input), PAGE_MAX);
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string | undefined | null): CursorPayload | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<CursorPayload>;
    if (typeof parsed.value !== "string" || typeof parsed.id !== "string") return null;
    return { value: parsed.value, id: parsed.id };
  } catch {
    return null;
  }
}

/**
 * Build the next cursor from the last item of a page, given the field
 * name we ordered by. Returns null when there's no further page.
 *
 * The generic is intentionally permissive — we just need the row to
 * carry both `id` and the order field, both as strings. Named row
 * interfaces (PortalTicketRow etc.) don't have a string index
 * signature, so we cast through `unknown` instead of constraining T.
 */
export function nextCursorFrom<T>(
  items: T[],
  field: keyof T,
  pageSize: number,
): string | null {
  if (items.length < pageSize) return null;
  const last = items[items.length - 1];
  if (!last) return null;
  const row = last as unknown as Record<string, unknown>;
  const value = row[field as string];
  const id    = row["id"];
  if (typeof value !== "string" || typeof id !== "string") return null;
  return encodeCursor({ value, id });
}
