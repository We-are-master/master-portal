# Master Portal

B2B customer portal for Master Group — deploys to **portal.getfixfy.com**.

Sibling app to [master-os](../master-os) (the staff dashboard). Shares the same
Supabase project; isolation between accounts is enforced by RLS policies tied
to `account_portal_users.account_id`.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Supabase (SSR auth, RLS, Realtime, Storage)
- Tailwind v4
- framer-motion, sonner, lucide-react
- Resend (transactional email)

## Setup

```bash
cp .env.example .env.local
# Fill in Supabase + Resend keys
npm install
npm run dev
```

Default port: 3000. Run the staff dashboard (`master-os`) on a different port
when running both locally.

## Auth

Portal users sign in via Supabase magic link. They must be invited from the
staff dashboard (`/admin/account/invite-portal-user` in master-os). Sign-up is
disabled (`shouldCreateUser: false`).

## URL env vars

- `NEXT_PUBLIC_APP_URL` — this app (used for magic-link callbacks)
- `NEXT_PUBLIC_DASHBOARD_URL` — staff dashboard (used in notification emails
  that link staff to the corresponding ticket / request / job)

## Deploy

Vercel project, root = repo root. Set env vars from `.env.example` in Vercel
project settings. Domain: `portal.getfixfy.com`.
