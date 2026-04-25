"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function PortalLoginClient() {
  const params = useSearchParams();
  const initialError = params.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    if (initialError === "link_expired") setError("That sign-in link has expired. Enter your email below to get a new one.");
    else if (initialError === "invalid_link") setError("That sign-in link is invalid. Enter your email below to get a new one.");
    else if (initialError === "not_portal_user") setError("This email is not registered as a portal user.");
  }, [initialError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.status === 429) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error ?? "Too many sign-in attempts. Please try again in a few minutes.");
      } else {
        setSent(true);
      }
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpError(null);
    const cleaned = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleaned)) { setOtpError("Enter the 6-digit code from your email."); return; }
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), token: cleaned }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setOtpError(typeof json.error === "string" ? json.error : "That code didn't work."); setVerifying(false); return; }
      window.location.assign("/");
    } catch (err) {
      console.error("[login] verify error:", err);
      setOtpError("We could not verify your code. Please try again.");
      setVerifying(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--navy)", position: "relative", overflow: "hidden",
    }}>
      {/* Background pattern */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
        <svg width="100%" height="100%"><defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0L0 0 0 48" fill="none" stroke="#fff" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>
      </div>
      {/* Gradient accent */}
      <div style={{ position: "absolute", bottom: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,76,11,0.25) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, margin: "0 auto 16px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://wearemaster.com/favicon.png" alt="Fixfy" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>fixfy</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4, fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Maintenance OS</div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)", borderRadius: 8, border: "1px solid var(--line)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}>
          {sent ? (
            <div style={{ padding: "28px 28px 24px" }}>
              {/* Check your email */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "#E7F5EC",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
                }}>
                  <svg viewBox="0 0 16 16" width={20} height={20} fill="none" stroke="var(--green)" strokeWidth={2}><path d="M3 8l3 3 7-7" /></svg>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Check your email</h2>
                <p style={{ fontSize: 13, color: "var(--slate-50)", lineHeight: 1.5 }}>
                  If <b style={{ color: "var(--ink)" }}>{email}</b> is registered, you&rsquo;ll receive a sign-in link and a 6-digit code.
                </p>
              </div>

              {/* OTP */}
              <form onSubmit={handleVerifyOtp}>
                <div style={{
                  borderTop: "1px solid var(--line)", paddingTop: 16, marginBottom: 12,
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--slate-50)", textAlign: "center",
                }}>OR ENTER THE 6-DIGIT CODE</div>

                {otpError && (
                  <div style={{ marginBottom: 12, background: "#FEE2E2", border: "1px solid #FECACA", color: "var(--red)", borderRadius: 5, padding: "8px 12px", fontSize: 12 }}>
                    {otpError}
                  </div>
                )}

                <div className="field" style={{ marginBottom: 12 }}>
                  <input
                    style={{
                      textAlign: "center", fontSize: 22, fontWeight: 600, letterSpacing: "0.5em",
                      fontFamily: "var(--mono)", padding: "12px 11px",
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    autoComplete="one-time-code"
                    disabled={verifying}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "10px 14px", opacity: verifying || code.length !== 6 ? 0.5 : 1 }}
                >
                  {verifying ? "Verifying…" : "Sign in with code"}
                </button>
              </form>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "var(--slate-50)" }}>
                  Didn&rsquo;t receive it? Check spam or{" "}
                  <a href="mailto:hello@wearemaster.com" style={{ color: "var(--coral-600)", fontWeight: 500 }}>contact us</a>
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setCode(""); setOtpError(null); }}
                  style={{ marginTop: 8, fontSize: 12, color: "var(--slate-70)", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "28px 28px 24px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>Sign in to your portal</h2>
              <p style={{ fontSize: 13, color: "var(--slate-50)", marginBottom: 20 }}>
                Enter the email address linked to your account. We&rsquo;ll send you a sign-in link.
              </p>

              {error && (
                <div style={{ marginBottom: 14, background: "#FEE2E2", border: "1px solid #FECACA", color: "var(--red)", borderRadius: 5, padding: "10px 12px", fontSize: 12 }}>
                  {error}
                </div>
              )}

              <div className="field">
                <label>Email address</label>
                <input
                  type="text"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "10px 14px", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Sending link…" : "Send sign-in link"}
              </button>

              <p style={{ fontSize: 11, color: "var(--slate-50)", textAlign: "center", marginTop: 16 }}>
                Don&rsquo;t have an account?{" "}
                <a href="/signup" style={{ color: "var(--coral-600)", fontWeight: 500 }}>Sign up</a>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--mono)" }}>
          Fixfy · Maintenance OS for UK businesses
        </div>
      </div>
    </div>
  );
}
