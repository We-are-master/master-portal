"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ACCOUNT_TYPES, type AccountType, DEFAULT_ACCOUNT_TYPE } from "@/lib/account-type";

const ICONS: Record<AccountType, string> = {
  real_estate: "🏘",
  franchise: "🏪",
  service: "⚡",
  enterprise: "🏢",
};

/**
 * Activated via `?onboarding=1`. Purely visual switcher — no backend
 * persistence yet (see TODO in src/lib/account-type.ts).
 */
export function OnboardingModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = searchParams.get("onboarding") === "1";

  const [acct, setAcct] = useState<AccountType>(DEFAULT_ACCOUNT_TYPE);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("onboarding");
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
  };

  const cur = ACCOUNT_TYPES[acct];

  return (
    <div className="mbg" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <div>
            <h2>Welcome to Fixfy OS</h2>
            <div className="meta">Preview how the platform adapts to your business type</div>
          </div>
          <button
            onClick={close}
            style={{ width: 30, height: 30, borderRadius: 5, border: "1px solid var(--ln)", background: "#fff", fontSize: 13 }}
          >
            ✕
          </button>
        </div>
        <div className="mb">
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--s50)",
              marginBottom: 10,
            }}
          >
            Switch business type
          </div>
          <div className="ob-switch">
            {Object.entries(ACCOUNT_TYPES).map(([k, a]) => (
              <div
                key={k}
                className={`ob-card${acct === k ? " on" : ""}`}
                onClick={() => setAcct(k as AccountType)}
              >
                <div className="ck">✓</div>
                <div className="icn">{ICONS[k as AccountType]}</div>
                <div className="t">{a.type}</div>
                <div className="d">{a.shortTitle}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--s10)", borderRadius: 8, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: cur.accountColor,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {cur.initials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{cur.type}</div>
                <div style={{ fontSize: 11, color: "var(--s50)", fontFamily: "var(--mono)" }}>{cur.shortTitle}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--s70)", lineHeight: 1.5, marginTop: 8 }}>{cur.desc}</div>
          </div>

          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--s50)",
              marginBottom: 10,
            }}
          >
            Built for {cur.type.toLowerCase()}
          </div>
          <div className="ob-features">
            {cur.features.map((f) => (
              <div key={f.t} className="ob-feat">
                <div className="dot" />
                <div>
                  <div className="t">{f.t}</div>
                  <div className="d">{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              background: "linear-gradient(135deg,rgba(2,0,64,.04),rgba(234,76,11,.04))",
              border: "1px solid rgba(2,0,64,.08)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--s70)", lineHeight: 1.6 }}>
              <b style={{ color: "var(--ink)" }}>Fixfy handles everything end-to-end.</b> Request → quote → execution →
              reporting → invoice. You monitor. We deliver.
            </div>
          </div>
        </div>
        <div className="df">
          <button className="btn btn-g btn-sm" onClick={close}>
            Close preview
          </button>
          <button className="btn btn-p btn-sm" onClick={close}>
            Continue as {cur.type} →
          </button>
        </div>
      </div>
    </div>
  );
}
