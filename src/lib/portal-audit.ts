/**
 * Portal-side audit log helper.
 *
 * Writes a row into `public.audit_logs` via the service role client so
 * RLS doesn't block. **Best-effort** — if the insert fails (e.g. the
 * mig 153 entity_type extension hasn't been applied yet), we log a
 * warning and return without throwing so the parent request still
 * succeeds. The audit trail is observability, not correctness — never
 * worth aborting a user-visible operation over.
 *
 * Pairs with master-os migration 153_audit_logs_extend_for_portal.sql,
 * which adds 'ticket' to the entity_type CHECK constraint. Other
 * entity types ('request', 'quote', 'invoice', 'account') are already
 * accepted by the existing constraint from mig 005.
 * Best-effort INSERT into public.audit_logs via the service-role client.
 * Swallows errors so observability work never aborts a user request.
 *
 * Pairs with master-os migration that allows entity_type='ticket' in
 * the audit_logs CHECK. Until that ships, ticket logs are silently
 * dropped (warn to console).
 */
import { createServiceClient } from "./supabase/service";

export type PortalAuditEntity = "ticket" | "request" | "quote" | "invoice" | "account";

export type PortalAuditAction =
  | "created"
  | "updated"
  | "status_changed"
  | "note"
  | "deleted"
  | "document_added"
  | "payment";

export interface PortalAuditEntry {
  entityType: PortalAuditEntity;
  entityId: string;
  entityRef?: string;
  action: PortalAuditAction;
  userId: string;
  userName?: string | null;
  fieldName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  metadata?: Record<string, unknown>;
  entityId:   string;
  entityRef?: string;
  action:     PortalAuditAction;
  userId:     string;
  userName?:  string | null;
  fieldName?: string;
  oldValue?:  string | null;
  newValue?:  string | null;
  metadata?:  Record<string, unknown>;
}

export async function logPortalAudit(entry: PortalAuditEntry): Promise<void> {
  try {
    const admin = createServiceClient();
    const { error } = await admin.from("audit_logs").insert({
      entity_type: entry.entityType,
      entity_id:   entry.entityId,
      entity_ref:  entry.entityRef ?? null,
      action:      entry.action,
      field_name:  entry.fieldName ?? null,
      old_value:   entry.oldValue ?? null,
      new_value:   entry.newValue ?? null,
      user_id:     entry.userId,
      user_name:   entry.userName ?? null,
      metadata:    {
        source: "portal",
        ...(entry.metadata ?? {}),
      },
    });
    if (error) {
      // Swallow — most likely cause is the entity_type CHECK rejecting
      // 'ticket' before mig 153 ships. Log so we notice in Sentry.
      console.warn("[portal-audit] insert failed:", error.message, { entry });
    }
  } catch (err) {
    console.warn("[portal-audit] threw:", err, { entry });
  }
}
