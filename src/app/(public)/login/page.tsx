import { Suspense } from "react";
import { PortalLoginClient } from "./portal-login-client";

export const metadata = {
  title: "Fixfy · Sign In",
  description: "Sign in to the Fixfy maintenance portal",
};

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy)" }}
        >
          <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <PortalLoginClient />
    </Suspense>
  );
}
