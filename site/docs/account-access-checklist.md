# MallowMauve Account Access Checklist

These are the exact access items needed to move from a green local build to a live production launch.

## 1. Vercel

Needed from your side:

- access to the Vercel account or team that will own the site
- ability to create or connect the MallowMauve project
- permission to add environment variables
- permission to add the custom domain

What I need if you want me to do it directly:

- either a Vercel login on this machine
- or an invited account with project-level access

## 2. Supabase

Needed from your side:

- production Supabase project URL
- anon key
- service role key
- dashboard access to run/verify the migration
- auth access so approved admin emails can use magic-link login

What I need if you want me to do it directly:

- Supabase dashboard/project access
- or the three env values plus confirmation that I should apply the migration SQL

## 3. PostHog

Needed from your side:

- project API key
- PostHog host
- optional project access if you want me to set up saved funnels/dashboards

## 4. Domain / DNS

Needed from your side:

- confirmation of canonical domain:
  - `www.mallowmauve.in` recommended
  - or `mallowmauve.in`
- Cloudflare or registrar DNS access
- ability to add the records Vercel asks for

What I need if you want me to do it directly:

- Cloudflare access or whoever manages DNS available during cutover

## 5. Admin Access

Needed from your side:

- the exact admin email(s) to allow in production
- confirmation whether `info@mallowmauve.com` should be the only admin initially or if there are more

## 6. WhatsApp

Needed from your side:

- confirmation that `+91-9990709988` is the final production WhatsApp destination
- confirmation of the default introductory message if you want any wording refinement before launch

## 7. Recommended Launch Sequence

1. Set production env vars in Vercel
2. Apply Supabase migration
3. Verify admin login via Supabase magic link
4. Deploy Vercel preview
5. Smoke test Wishlist / Selections / WhatsApp / contact form
6. Add domain in Vercel
7. Update DNS in Cloudflare
8. Verify SSL and canonical redirects
9. Run launch-day checks
