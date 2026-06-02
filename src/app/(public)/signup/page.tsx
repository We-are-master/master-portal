import type { Metadata } from "next";
import { SignupClient } from "./signup-client";

export const metadata: Metadata = {
  title: "Sign up · Fixfy",
  description: "Create your Fixfy account in 30 seconds.",
};

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return <SignupClient />;
}
