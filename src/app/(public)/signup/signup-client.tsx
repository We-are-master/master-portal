"use client";

import Link from "next/link";
import { useState } from "react";

type AccountType = "real_estate" | "franchise" | "service" | "enterprise";

const ACCOUNT_TYPES: Array<{
  id:    AccountType;
  icon:  string;
  title: string;
  desc:  string;
  examples: string;
}> = [
  {
    id: "real_estate",
    icon: "🏘",
    title: "Real Estate",
    desc:  "Property managers, lettings agencies, landlords",
    examples: "Track properties, tenancies, compliance, PPM per unit",
  },
  {
    id: "franchise",
    icon: "🏪",
    title: "Franchise",
    desc:  "Multi-location franchise operators",
    examples: "One dashboard, every site consistent and compliant",
  },
  {
    id: "service",
    icon: "⚡",
    title: "Service Platform",
    desc:  "Resell maintenance services to your own clients",
    examples: "White-label execution, your brand on the front",
  },
  {
    id: "enterprise",
    icon: "🏢",
    title: "Enterprise",
    desc:  "Single or multi-site direct customers",
    examples: "From flagship locations to a national estate",
  },
];

interface FormState {
  account_type:    AccountType | null;
  company_name:    string;
  contact_name:    string;
  email:           string;
  phone:           string;
  address:         string;
  estimated_sites: string; // free text
  agreed_terms:    boolean;
}

const INITIAL: FormState = {
  account_type:    null,
  company_name:    "",
  contact_name:    "",
  email:           "",
  phone:           "",
  address:         "",
  estimated_sites: "",
  agreed_terms:    false,
};

export function SignupClient() {
  const [step, setStep]       = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm]       = useState<FormState>(INITIAL);
  const [pending, setPending] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function canAdvance(): boolean {
    if (step === 1) return form.account_type != null;
    if (step === 2) return form.company_name.trim().length >= 2 && form.address.trim().length >= 4;
    if (step === 3) {
      return (
        form.contact_name.trim().length >= 2 &&
        form.email.trim().includes("@") &&
        form.email.trim().length >= 5
      );
    }
    if (step === 4) return form.agreed_terms;
    return false;
  }

  async function submit() {
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          account_type:    form.account_type,
          company_name:    form.company_name.trim(),
          contact_name:    form.contact_name.trim(),
          email:           form.email.trim().toLowerCase(),
          phone:           form.phone.trim() || null,
          address:         form.address.trim(),
          estimated_sites: form.estimated_sites.trim() || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit. Try again?");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="signup-shell">
        <div className="signup-card" style={{ maxWidth: 500, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📨</div>
          <h1 className="fx-h1" style={{ marginBottom: 12 }}>Check your email</h1>
          <p style={{ color: "var(--s70)", lineHeight: 1.55 }}>
            We just sent a magic link to <b>{form.email}</b>. Click it to verify your
            email and you&rsquo;re in. Check spam if you don&rsquo;t see it within a minute.
          </p>
          <div style={{ marginTop: 24, fontSize: 12, color: "var(--s50)" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--co)" }}>Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-shell">
      <header className="signup-header">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#fff" }}>
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em" }}>Fixfy</span>
          <span className="v" style={{
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".14em",
            padding: "2px 6px", border: "1px solid rgba(255,255,255,.2)", borderRadius: 3,
            color: "rgba(255,255,255,.6)",
          }}>Client OS</span>
        </Link>
        <Link href="/login" className="signup-link">Already have an account →</Link>
      </header>

      <main className="signup-main">
        <div className="signup-card">
          <div className="signup-progress">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`signup-progress-step${n === step ? " on" : n < step ? " done" : ""}`}
              >
                {n < step ? "✓" : n}
              </div>
            ))}
          </div>

          {step === 1 && <Step1 form={form} update={update} />}
          {step === 2 && <Step2 form={form} update={update} />}
          {step === 3 && <Step3 form={form} update={update} />}
          {step === 4 && <Step4 form={form} update={update} error={error} />}

          <div className="signup-actions">
            {step > 1 ? (
              <button
                className="btn btn-g btn-sm"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                disabled={pending}
              >
                ← Back
              </button>
            ) : <div />}
            {step < 4 ? (
              <button
                className="btn btn-p"
                onClick={() => canAdvance() && setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                disabled={!canAdvance()}
              >
                Continue →
              </button>
            ) : (
              <button
                className="btn btn-p"
                onClick={submit}
                disabled={!canAdvance() || pending}
              >
                {pending ? "Creating account…" : "Create account"}
              </button>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .signup-shell {
          min-height: 100vh;
          background: linear-gradient(180deg, var(--n) 0%, var(--n2) 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
        }
        .signup-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 32px;
        }
        .signup-link {
          font-size: 13px; color: rgba(255,255,255,.7); text-decoration: none;
        }
        .signup-link:hover { color: #fff; }
        .signup-main {
          flex: 1; display: flex; align-items: flex-start; justify-content: center;
          padding: 24px 24px 80px;
        }
        .signup-card {
          width: 100%; max-width: 720px;
          background: #fff; color: var(--ink);
          border-radius: 12px; padding: 36px 36px 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
        }
        .signup-progress {
          display: flex; gap: 8px; justify-content: center; margin-bottom: 28px;
        }
        .signup-progress-step {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 500; font-family: var(--mono);
          background: var(--s10); color: var(--s50);
          transition: all .15s;
        }
        .signup-progress-step.on   { background: var(--co); color: #fff; }
        .signup-progress-step.done { background: var(--gr); color: #fff; }
        .signup-actions {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--ln);
        }
        .signup-input-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px;
        }
        .signup-field { display: flex; flex-direction: column; gap: 4px; }
        .signup-field label {
          font-size: 11px; font-weight: 500; color: var(--s70);
          font-family: var(--sans);
        }
        .signup-field input, .signup-field textarea {
          padding: 10px 12px; border: 1px solid var(--ln); border-radius: 5px;
          font-size: 14px; outline: none; transition: border-color .08s;
          font-family: inherit; color: var(--ink);
        }
        .signup-field input:focus, .signup-field textarea:focus {
          border-color: var(--co);
        }
        .signup-field textarea { min-height: 70px; resize: vertical; }
        @media (max-width: 640px) {
          .signup-input-row { grid-template-columns: 1fr; }
          .signup-card { padding: 24px 20px; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Step1({ form, update }: {
  form:   FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <>
      <h1 className="fx-h2" style={{ marginBottom: 6 }}>What kind of business are you?</h1>
      <p style={{ color: "var(--s70)", fontSize: 13, marginBottom: 22 }}>
        Pick the option that fits best — Fixfy adapts the dashboard, terminology and
        workflows to your business type.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}>
        {ACCOUNT_TYPES.map((t) => {
          const selected = form.account_type === t.id;
          return (
            <div
              key={t.id}
              onClick={() => update("account_type", t.id)}
              style={{
                padding: 16,
                border: `2px solid ${selected ? "var(--co)" : "var(--ln)"}`,
                borderRadius: 8,
                background: selected ? "rgba(234,76,11,.04)" : "#fff",
                cursor: "pointer",
                transition: "all .12s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "var(--s70)", marginBottom: 4 }}>{t.desc}</div>
                  <div style={{ fontSize: 11, color: "var(--s50)", lineHeight: 1.45 }}>{t.examples}</div>
                </div>
                {selected && (
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "var(--co)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 10,
                  }}>✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Step2({ form, update }: {
  form:   FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <>
      <h1 className="fx-h2" style={{ marginBottom: 6 }}>About your company</h1>
      <p style={{ color: "var(--s70)", fontSize: 13, marginBottom: 18 }}>
        Used on invoices, reports and the staff dashboard. You can refine later in Settings.
      </p>
      <div className="signup-field">
        <label>Company name *</label>
        <input
          type="text"
          value={form.company_name}
          onChange={(e) => update("company_name", e.target.value)}
          placeholder="Acme Estates Ltd"
          autoFocus
        />
      </div>
      <div className="signup-input-row">
        <div className="signup-field">
          <label>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+44 20 7946 0000"
          />
        </div>
        <div className="signup-field">
          <label>Estimated sites / properties</label>
          <input
            type="text"
            value={form.estimated_sites}
            onChange={(e) => update("estimated_sites", e.target.value)}
            placeholder="e.g. 1, 5, 50, 1000+"
          />
        </div>
      </div>
      <div className="signup-field" style={{ marginTop: 14 }}>
        <label>Registered address *</label>
        <textarea
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="42 Baker Street, London W1U 7DB"
        />
      </div>
    </>
  );
}

function Step3({ form, update }: {
  form:   FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <>
      <h1 className="fx-h2" style={{ marginBottom: 6 }}>Your contact details</h1>
      <p style={{ color: "var(--s70)", fontSize: 13, marginBottom: 18 }}>
        We&rsquo;ll send a magic link to your email — no password needed.
      </p>
      <div className="signup-input-row">
        <div className="signup-field">
          <label>Full name *</label>
          <input
            type="text"
            value={form.contact_name}
            onChange={(e) => update("contact_name", e.target.value)}
            placeholder="Priya Nair"
            autoFocus
          />
        </div>
        <div className="signup-field">
          <label>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@yourcompany.co.uk"
          />
        </div>
      </div>
    </>
  );
}

function Step4({
  form,
  update,
  error,
}: {
  form:   FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  error:  string | null;
}) {
  const accountType = ACCOUNT_TYPES.find((t) => t.id === form.account_type);
  return (
    <>
      <h1 className="fx-h2" style={{ marginBottom: 6 }}>Review and create</h1>
      <p style={{ color: "var(--s70)", fontSize: 13, marginBottom: 18 }}>
        We&rsquo;ll create your account and send a magic link to verify your email.
      </p>
      <div className="blk" style={{ marginBottom: 16 }}>
        <div className="bb" style={{ padding: "16px 18px" }}>
          <div className="inf">
            <span className="k">Type</span>
            <span><b>{accountType?.title}</b> {accountType ? `· ${accountType.desc}` : ""}</span>
            <span className="k">Company</span><span><b>{form.company_name}</b></span>
            <span className="k">Address</span><span>{form.address}</span>
            {form.phone && (<><span className="k">Phone</span><span>{form.phone}</span></>)}
            <span className="k">You</span><span><b>{form.contact_name}</b> · {form.email}</span>
            {form.estimated_sites && (
              <><span className="k">Sites</span><span>{form.estimated_sites}</span></>
            )}
          </div>
        </div>
      </div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--s70)", lineHeight: 1.5, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.agreed_terms}
          onChange={(e) => update("agreed_terms", e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          I agree to the{" "}
          <a href="https://wearemaster.com/terms" target="_blank" rel="noreferrer" style={{ color: "var(--co)" }}>Terms of Service</a>{" "}
          and{" "}
          <a href="https://wearemaster.com/privacy" target="_blank" rel="noreferrer" style={{ color: "var(--co)" }}>Privacy Policy</a>.
        </span>
      </label>
      {error && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.25)", borderRadius: 5, fontSize: 12, color: "var(--rd)" }}>
          {error}
        </div>
      )}
    </>
  );
}
