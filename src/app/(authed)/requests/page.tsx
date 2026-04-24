"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QUOTES_ALL } from "@/lib/mocks/portal-v2";

type Tab = "awaiting_price" | "received" | "approved" | "rejected" | "quotes";

const KPIS = [
  { lbl: "Awaiting price", val: 1, sub: "SLA 8h" },
  { lbl: "Received", val: 1, sub: "Awaiting your call" },
  { lbl: "Approved MTD", val: 8, sub: "£4,240 value" },
  { lbl: "Total value MTD", val: "£4,240", sub: "Approved" },
];

function RequestsInner() {
  const sp = useSearchParams();
  const initialTab = (sp.get("tab") as Tab) || "awaiting_price";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showDrawer, setShowDrawer] = useState(false);
  const [step, setStep] = useState(1);

  const counts = {
    awaiting_price: QUOTES_ALL.filter((q) => q.status === "awaiting_price").length,
    received: QUOTES_ALL.filter((q) => q.status === "received").length,
    approved: QUOTES_ALL.filter((q) => q.status === "approved").length,
    rejected: QUOTES_ALL.filter((q) => q.status === "rejected").length,
    quotes: QUOTES_ALL.length,
  };

  const listed =
    tab === "quotes"
      ? QUOTES_ALL
      : QUOTES_ALL.filter((q) => q.status === tab);

  const statusPill = (s: typeof QUOTES_ALL[number]["status"]) =>
    s === "awaiting_price"
      ? { cls: "w", l: "Awaiting price" }
      : s === "received"
      ? { cls: "c", l: "Received" }
      : s === "approved"
      ? { cls: "ok", l: "Approved" }
      : { cls: "r", l: "Rejected" };

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>Requests</h1>
          <p className="sub">Submit a request, review quotes, approve jobs. Fixfy handles the rest.</p>
        </div>
        <div className="acts">
          <button className="btn btn-p" onClick={() => setShowDrawer(true)}>+ New request</button>
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
          ["awaiting_price", "Awaiting Price"],
          ["received", "Received"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
          ["quotes", "All quotes"],
        ] as [Tab, string][]).map(([id, l]) => (
          <div key={id} className={`ptab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
            {l}
            <span className="ct">{counts[id]}</span>
          </div>
        ))}
      </div>

      <div className="blk">
        <div className="tbar">
          <div className="srch">
            <span style={{ fontSize: 13, color: "var(--s50)" }}>⌕</span>
            <input placeholder="Search quotes…" />
          </div>
          <span className="fc on">All services ▾</span>
        </div>
        {listed.length === 0 ? (
          <div className="empty">
            <div className="ic-lg">·</div>
            <div className="t">No items</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Quote</th>
                <th>Service</th>
                <th>Site</th>
                <th>Submitted</th>
                <th>Total</th>
                <th>SLA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {listed.map((q) => {
                const p = statusPill(q.status);
                return (
                  <tr key={q.id}>
                    <td>
                      <div className="b">{q.scope}</div>
                      <div className="mu mono">{q.id}</div>
                    </td>
                    <td><span className="pill n">{q.svc}</span></td>
                    <td style={{ fontSize: 12 }}>{q.site}</td>
                    <td className="mono mu">{q.submitted}</td>
                    <td className="b mono">{q.total}</td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 11,
                          color:
                            q.slaPct < 50 ? "var(--rd)" : q.slaPct < 75 ? "var(--am)" : "var(--gr)",
                        }}
                      >
                        {q.slaLeft}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${p.cls}`}>
                        <span className="d" />
                        {p.l}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showDrawer && (
        <div className="dbg" onClick={() => setShowDrawer(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="dh">
              <div>
                <h2>New request</h2>
                <div className="meta">Step {step} of 3</div>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                style={{ width: 30, height: 30, borderRadius: 5, border: "1px solid var(--ln)", background: "#fff", fontSize: 13 }}
              >
                ✕
              </button>
            </div>
            <div className="db">
              {step === 1 && (
                <>
                  <div className="kk" style={{ marginBottom: 10 }}>What kind of work?</div>
                  <div className="req-type">
                    {[
                      { i: "⚡", n: "One-off job", d: "A single task (leak, repair, clean)" },
                      { i: "£", n: "Quote first", d: "Get a price before approving" },
                      { i: "🔁", n: "Recurring", d: "PPM, weekly cleaning, security" },
                    ].map((it) => (
                      <div key={it.n} className="rt">
                        <div className="ri">{it.i}</div>
                        <div className="rn">{it.n}</div>
                        <div className="rd">{it.d}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="kk" style={{ marginBottom: 10 }}>Describe the issue</div>
                  <div className="f">
                    <label>Site</label>
                    <select>
                      <option>Flat 4, 52 Marylebone Lane</option>
                      <option>14 Exmouth Market</option>
                    </select>
                  </div>
                  <div className="f">
                    <label>Priority</label>
                    <select>
                      <option>P1 — Emergency (2h)</option>
                      <option>P2 — Urgent (24h)</option>
                      <option>P3 — Planned (5d)</option>
                    </select>
                  </div>
                  <div className="f">
                    <label>Scope / description</label>
                    <textarea placeholder="What needs doing?" />
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="kk" style={{ marginBottom: 10 }}>Review & submit</div>
                  <div className="inf">
                    <span className="k">Site</span><span>Flat 4, 52 Marylebone Lane</span>
                    <span className="k">Priority</span><span>P2 — Urgent</span>
                    <span className="k">Scope</span><span>See description</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--s70)", marginTop: 12 }}>
                    Fixfy will respond within SLA and revert with a quote or assigned technician.
                  </p>
                </>
              )}
            </div>
            <div className="df">
              <button
                className="btn btn-g btn-sm"
                onClick={() => (step > 1 ? setStep(step - 1) : (setShowDrawer(false), setStep(1)))}
              >
                ← {step > 1 ? "Back" : "Cancel"}
              </button>
              {step < 3 ? (
                <button className="btn btn-p btn-sm" onClick={() => setStep(step + 1)}>
                  Continue →
                </button>
              ) : (
                <button
                  className="btn btn-p btn-sm"
                  onClick={() => {
                    setShowDrawer(false);
                    setStep(1);
                  }}
                >
                  Submit ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <RequestsInner />
    </Suspense>
  );
}
