# MallowMauve Go-Live Checklist

## 1. Environment Readiness

- Create Vercel project for `site/`
- Add all production environment variables from `.env.example`
- Add preview environment variables separately from production
- Confirm `NEXT_PUBLIC_SITE_URL` matches the final canonical domain
- Confirm `MALLOWMAUVE_WHATSAPP_NUMBER` is the live business destination

## 2. Supabase Setup

- Create production Supabase project
- Run `supabase/migrations/20260408_initial_production_stack.sql`
- Confirm RLS is enabled on all lead/session/admin tables
- Enable email auth for admin users
- Add approved admin emails
- Capture each admin’s `auth_user_id`
- Run admin bootstrap seed script if needed

## 3. PostHog Setup

- Create production PostHog project
- Set `NEXT_PUBLIC_POSTHOG_KEY`
- Set `NEXT_PUBLIC_POSTHOG_HOST`
- Confirm events are arriving from preview before production cutover
- Create saved funnels for:
  - Collection View → Product View
  - Product View → Add to Wishlist
  - Product View → Add to Selections
  - Selections → WhatsApp Click
  - WhatsApp Click → Confirmed Lead

## 4. Vercel Deployment

- Connect repo to Vercel
- Set root directory to `site`
- Confirm framework is detected as Next.js
- Set preview and production env vars
- Deploy preview
- Run smoke test:
  - homepage loads
  - collection pages load
  - product pages load
  - contact inquiry submits
  - session cookie appears
  - WhatsApp payload endpoint returns `lead_ref`
  - admin login works with approved email

## 5. Functional Smoke Test

- Open site in new private window
- Confirm `session_ref` is created
- Add one item to Wishlist
- Add one item to Selections
- Trigger WhatsApp CTA
- Confirm `lead_ref` appears in the generated message
- Verify lead, session, and events in admin views / database

## 6. Admin Operations Check

- Confirm `/admin` dashboard loads
- Confirm leads table is populated
- Confirm lead detail timeline loads
- Confirm note creation works
- Confirm stage update works
- Confirm WhatsApp confirmation works

## 7. Domain And SSL

- Follow `docs/domain-dns-checklist.md`
- Confirm apex and `www` behavior
- Confirm SSL is issued
- Confirm redirects are correct

## 8. Logging And Monitoring

- Confirm server logs visible in Vercel
- Confirm PostHog events from production domain
- Confirm Supabase query activity and auth logs
- Add uptime monitor against `/api/health`

## 9. Launch-Day Checklist

- Freeze content changes briefly during DNS cutover
- Deploy latest green build
- Validate canonical metadata and domain
- Test WhatsApp CTA from desktop and mobile
- Test contact inquiry submission
- Confirm at least one admin receives and reconciles a test lead

## 10. After Launch

- Review first-day lead funnel
- Check sessions with wishlist only
- Check sessions with selections but no WhatsApp click
- Check stale leads over 24 hours
- Review top viewed collections and top selected products

