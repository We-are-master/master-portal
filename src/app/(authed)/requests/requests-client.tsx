"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader } from "@/components/portal/drawer";
import type { PortalQuoteDetail, PortalQuoteRow } from "@/lib/server-fetchers/portal-quotes";
import type { PortalRequestRow } from "@/lib/server-fetchers/portal-requests";

type Tab = "open_requests" | "awaiting_quote" | "approved" | "rejected" | "all";

interface Props {
  requests: PortalRequestRow[];
  quotes:   PortalQuoteRow[];
}

const REQUEST_STATUS: Record<string, { l: string; cls: string }> = {
  new:       { l: "New",        cls: "b" },
  in_review: { l: "In review",  cls: "w" },
  qualified: { l: "Qualified",  cls: "c" },
  rejected:  { l: "Rejected",   cls: "r" },
  archived:  { l: "Archived",   cls: "n" },
};

const QUOTE_STATUS: Record<string, { l: string; cls: string }> = {
  awaiting_customer: { l: "Awaiting your decision", cls: "w" },
  accepted:          { l: "Accepted",               cls: "ok" },
  rejected:          { l: "Declined",               cls: "r" },
  converted_to_job:  { l: "Converted to job",       cls: "ok" },
  draft:             { l: "Draft",                  cls: "n" },
  in_survey:         { l: "In survey",              cls: "b" },
  bidding:           { l: "Bidding",                cls: "b" },
};

function formatGBP(n: number): string {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 });
}

export function RequestsClient({ requests, quotes }: Props) {
  const sp = useSearchParams();
  const initialTab = (sp.get("tab") as Tab) || "open_requests";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [openQuoteId, setOpenQuoteId] = useState<string | null>(sp.get("id"));

  const openRequests   = useMemo(() => requests.filter((r) => ["new", "in_review", "qualified"].includes(r.status)), [requests]);
  const awaitingQuotes = useMemo(() => quotes.filter((q) => q.status === "awaiting_customer"),                       [quotes]);
  const approvedQuotes = useMemo(() => quotes.filter((q) => ["accepted", "converted_to_job"].includes(q.status)),    [quotes]);
  const rejectedQuotes = useMemo(() => quotes.filter((q) => q.status === "rejected"),                                [quotes]);

  const counts = {
    open_requests:  openRequests.length,
    awaiting_quote: awaitingQuotes.length,
    approved:       approvedQuotes.length,
    rejected:       rejectedQuotes.length,
    all:            requests.length + quotes.length,
  };

  const totalApprovedValue = approvedQuotes.reduce((s, q) => s + Number(q.total_value ?? 0), 0);

  const KPIS = [
    { lbl: "Open requests",   val: counts.open_requests,            sub: "Awaiting triage" },
    { lbl: "Awaiting quote",  val: counts.awaiting_quote,           sub: "Need your decision" },
    { lbl: "Approved MTD",    val: counts.approved,                 sub: `${formatGBP(totalApprovedValue)} value` },
    { lbl: "Total submitted", val: requests.length + quotes.length, sub: "Lifetime" },
  ];

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Requests &amp; Quotes</h1>
          <p className="sub">Submit a request, review quotes, approve jobs. Fixfy handles the rest.</p>
        </div>
        <div className="acts">
          <button className="btn btn-p">+ New request</button>
        </div>
      </div>

      <div className="kg">
        {KPIS.map((k) => (
          <div className="kpi" key={k.lbl}>
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}</div>
            <div className="tr flat">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="ptabs">
        {([
          ["open_requests",  "Open requests"],
          ["awaiting_quote", "Awaiting quote"],
          ["approved",       "Approved"],
          ["rejected",       "Rejected"],
          ["all",            "All"],
        ] as [Tab, string][]).map(([id, l]) => (
          <div key={id} className={`ptab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
            {l}
            <span className="ct">{counts[id]}</span>
          </div>
        ))}
      </div>

      <div className="blk">
        {tab === "open_requests" && <RequestsTable rows={openRequests} />}
        {tab === "awaiting_quote" && <QuotesTable rows={awaitingQuotes} onOpen={setOpenQuoteId} />}
        {tab === "approved" && <QuotesTable rows={approvedQuotes} onOpen={setOpenQuoteId} />}
        {tab === "rejected" && <QuotesTable rows={rejectedQuotes} onOpen={setOpenQuoteId} />}
        {tab === "all" && (
          <>
            <div className="kk" style={{ padding: "12px 14px" }}>Open requests</div>
            <RequestsTable rows={openRequests} />
            <div className="kk" style={{ padding: "12px 14px", borderTop: "1px solid var(--ln)" }}>Quotes</div>
            <QuotesTable rows={quotes} onOpen={setOpenQuoteId} />
          </>
        )}
      </div>

      {openQuoteId && (
        <QuoteDrawer quoteId={openQuoteId} onClose={() => setOpenQuoteId(null)} />
      )}
    </div>
  );
}

function QuoteDrawer({ quoteId, onClose }: { quoteId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<PortalQuoteDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    fetch(`/api/quotes/${encodeURIComponent(quoteId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j?.quote) setDetail(j.quote as PortalQuoteDetail);
        else setError(j?.error ?? "Could not load quote");
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => { cancelled = true; };
  }, [quoteId]);

  return (
    <Drawer open={true} onClose={onClose}>
      <DrawerHeader
        title={detail?.title ?? "Loading…"}
        meta={detail ? `${detail.reference} · ${detail.client_name}` : undefined}
        onClose={onClose}
      />
      <DrawerBody>
        {error && (
          <div className="empty">
            <div className="ic-lg">!</div>
            <div className="t">{error}</div>
          </div>
        )}
        {!detail && !error && (
          <div className="bb"><span style={{ fontSize: 12, color: "var(--s50)" }}>Loading quote…</span></div>
        )}
        {detail && (
          <>
            <div className="kg">
              <div className="kpi">
                <div className="lbl">Total</div>
                <div className="val">{formatGBP(Number(detail.total_value ?? 0))}</div>
                <div className="tr flat">Inc. VAT</div>
              </div>
              <div className="kpi">
                <div className="lbl">Deposit</div>
                <div className="val">{detail.deposit_required > 0 ? formatGBP(Number(detail.deposit_required)) : "—"}</div>
                <div className="tr flat">{detail.deposit_required > 0 ? "Required" : "None"}</div>
              </div>
              <div className="kpi">
                <div className="lbl">Status</div>
                <div className="val" style={{ fontSize: 14, fontWeight: 500 }}>
                  {(QUOTE_STATUS[detail.status] ?? { l: detail.status }).l}
                </div>
                <div className="tr flat">{detail.partner_name ?? "—"}</div>
              </div>
            </div>

            {detail.email_custom_message && (
              <div className="blk" style={{ marginTop: 12 }}>
                <div className="bh"><h3>Message from Master</h3></div>
                <div className="bb">
                  <p style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {detail.email_custom_message}
                  </p>
                </div>
              </div>
            )}

            {detail.scope && (
              <div className="blk" style={{ marginTop: 12 }}>
                <div className="bh"><h3>Scope of work</h3></div>
                <div className="bb">
                  <p style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {detail.scope}
                  </p>
                </div>
              </div>
            )}

            {detail.line_items.length > 0 && (
              <div className="blk" style={{ marginTop: 12 }}>
                <div className="bh"><h3>Line items</h3></div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: "right", width: 60 }}>Qty</th>
                      <th style={{ textAlign: "right", width: 80 }}>Unit</th>
                      <th style={{ textAlign: "right", width: 90 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.line_items.map((li) => (
                      <tr key={li.id}>
                        <td>{li.description}</td>
                        <td className="mono mu" style={{ textAlign: "right" }}>{li.quantity}</td>
                        <td className="mono mu" style={{ textAlign: "right" }}>{formatGBP(Number(li.unit_price))}</td>
                        <td className="mono b" style={{ textAlign: "right" }}>{formatGBP(Number(li.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: "right", fontWeight: 500 }}>Total</td>
                      <td className="mono b" style={{ textAlign: "right" }}>
                        {formatGBP(Number(detail.total_value ?? 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}
      </DrawerBody>
      <DrawerFooter>
        <button className="btn btn-g btn-sm" onClick={onClose}>Close</button>
        {detail?.status === "awaiting_customer" && (
          <>
            <button className="btn btn-rd btn-sm">Reject</button>
            <button className="btn btn-p btn-sm">Approve</button>
          </>
        )}
      </DrawerFooter>
    </Drawer>
  );
}

function RequestsTable({ rows }: { rows: PortalRequestRow[] }) {
  if (rows.length === 0) {
    return <div className="empty"><div className="ic-lg">·</div><div className="t">No items</div></div>;
  }
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Request</th>
          <th>Service</th>
          <th>Site</th>
          <th>Submitted</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const s = REQUEST_STATUS[r.status] ?? { l: r.status, cls: "n" };
          return (
            <tr key={r.id}>
              <td>
                <div className="b">{r.description ? r.description.slice(0, 60) : r.service_type}</div>
                <div className="mu mono">{r.reference}</div>
              </td>
              <td><span className="pill n">{r.service_type}</span></td>
              <td style={{ fontSize: 12 }}>{r.property_address ?? "—"}</td>
              <td className="mono mu">{new Date(r.created_at).toLocaleDateString("en-GB")}</td>
              <td><span className={`pill ${s.cls}`}><span className="d" />{s.l}</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function QuotesTable({ rows, onOpen }: { rows: PortalQuoteRow[]; onOpen: (id: string) => void }) {
  if (rows.length === 0) {
    return <div className="empty"><div className="ic-lg">·</div><div className="t">No items</div></div>;
  }
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Quote</th>
          <th>Site</th>
          <th>Total</th>
          <th>Submitted</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((q) => {
          const s = QUOTE_STATUS[q.status] ?? { l: q.status, cls: "n" };
          return (
            <tr key={q.id} onClick={() => onOpen(q.id)} style={{ cursor: "pointer" }}>
              <td>
                <div className="b">{q.title}</div>
                <div className="mu mono">{q.reference}</div>
              </td>
              <td style={{ fontSize: 12 }}>{q.property_address ?? "—"}</td>
              <td className="b mono">{formatGBP(Number(q.total_value ?? 0))}</td>
              <td className="mono mu">{new Date(q.created_at).toLocaleDateString("en-GB")}</td>
              <td><span className={`pill ${s.cls}`}><span className="d" />{s.l}</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
