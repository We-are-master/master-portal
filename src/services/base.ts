/**
 * Minimal browser-side Supabase accessor for the portal.
 *
 * The dashboard version of this file ships a large toolkit for paginated
 * lists, status counts, schedule overlap queries, etc. The portal only
 * needs the basic client accessor and a handful of type defaults, so we
 * keep this file tiny on purpose.
 */
import { createClient } from "@/lib/supabase/client";

export function getSupabase() {
  return createClient();
}

export type SortDirection = "asc" | "desc";

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  statusIn?: string[];
  sortBy?: string;
  sortDir?: SortDirection;
  dateFrom?: string;
  dateTo?: string;
}

export interface ListResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
