# MallowMauve Production App

This directory contains the production-ready Next.js application for MallowMauve.

It keeps the approved luxury frontend experience intact while adding the backend and operational layer required for launch:

- Next.js app runtime for Vercel
- Supabase-backed anonymous session and lead tracking
- PostHog instrumentation hooks
- admin login and lead operations pages
- server-side API routes for sessions, wishlists, selections, WhatsApp intent, and contact inquiries

## Stack

- Frontend/App: Next.js 15
- Hosting: Vercel
- Database/Auth: Supabase Postgres + Supabase Auth
- Analytics: PostHog

## Content And Asset Source Of Truth

Approved project-local sources only:

- Brand assets: `public/brand/**`
- Collection hero assets: `public/media/collections/**`
- Product assets: `public/media/products/**`
- Video assets: `public/media/videos/**`
- Collection metadata: `src/content/collections.json`
- Product metadata: `src/content/products/*.json`

The production app normalizes `/public/...` file references from the JSON content into Next.js public URLs at runtime. No asset guessing or desktop/download scanning is used.

## Environment Setup

Copy `.env.example` to `.env.local` and fill the real values:

```bash
cp .env.example .env.local
```

Required public and server variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWED_EMAILS`
- `MALLOWMAUVE_WHATSAPP_NUMBER`
- `WHATSAPP_PREFILL_DEFAULT_MESSAGE`
- `NEXT_PUBLIC_APP_ENV`

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Run checks:

```bash
npm run typecheck
npm run build
npm run ops:preflight
```

## Database And Admin Bootstrap

Apply the migration in:

- `supabase/migrations/20260408_initial_production_stack.sql`

After Supabase Auth is configured and at least one approved admin email exists, you can bootstrap the matching admin user record with:

```bash
npm run db:seed-admin -- --auth-user-id=<SUPABASE_AUTH_USER_ID> --email=<ADMIN_EMAIL> --name=<DISPLAY_NAME>
```

## Lead References

Two human-readable identifiers are used:

- `session_ref`: generated on first landing, for example `MM-S-9X4K2P`
- `lead_ref`: generated on the first meaningful lead action, for example `MM-L-000127`

Current lead-creation triggers are server-side and can happen when the visitor:

- submits a contact inquiry
- adds to Wishlist
- adds to Selections
- clicks a WhatsApp CTA

These references are stored in a first-party cookie/local storage pair so the visitor can continue the same journey across pages.

## WhatsApp Tracking: What Can And Cannot Be Known

The current WhatsApp flow uses a plain `wa.me` deep link.

This means:

What we can know:

- that the visitor clicked a WhatsApp CTA
- which session/lead triggered the click
- which products were included in the prefilled message
- the generated `lead_ref`

What we cannot guarantee with plain `wa.me`:

- that the user actually sent the message
- that the user completed the chat
- that the message was delivered

Because of this, `whatsapp_clicked` is treated as an intent signal, not a confirmed inbound lead.

## Manual WhatsApp Confirmation

Each WhatsApp prefill includes the `lead_ref`.

Example:

```text
Lead Reference: MM-L-000127
```

When the MallowMauve team sees the same reference in an inbound WhatsApp conversation, an admin should:

1. open `/admin/leads`
2. search the matching `lead_ref`
3. mark the lead as `whatsapp_confirmed`

That preserves a truthful audit trail between click intent and confirmed inbound contact.

## Future Upgrade Path: WhatsApp Business API

The code is structured so the current flow can later be upgraded to a WhatsApp Business API webhook flow.

Future upgrade path:

1. receive inbound WhatsApp webhook
2. parse the included `lead_ref`
3. match the lead automatically
4. set `whatsapp_confirmed_at`
5. move the stage to `whatsapp_confirmed`

Until that exists, confirmation remains manual by design.

## Admin Panel

Current routes:

- `/admin`
- `/admin/leads`
- `/admin/leads/[leadRef]`
- `/admin/sessions`
- `/admin/analytics`
- `/admin/settings`

Admin access uses Supabase Auth and approved emails from `ADMIN_ALLOWED_EMAILS`.
PostHog is optional for first launch; if `NEXT_PUBLIC_POSTHOG_KEY` is omitted, the site runs without analytics capture until the key is added.

## Deployment

See:

- `docs/go-live-checklist.md`
- `docs/domain-dns-checklist.md`
- `docs/account-access-checklist.md`
