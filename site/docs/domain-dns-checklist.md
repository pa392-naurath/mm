# MallowMauve Domain And DNS Checklist

This document is registrar-agnostic and Cloudflare-ready.

## Information Ops Team Must Provide

- registrar name
- current nameserver setup
- whether Cloudflare will manage DNS or only proxy it
- preferred canonical domain:
  - `mallowmauve.in`
  - or `www.mallowmauve.in`

## Recommended Canonical Setup

Recommended:

- canonical domain: `www.mallowmauve.in`
- apex domain `mallowmauve.in` redirects to `www`

This is optional, but whichever version is chosen should be consistent across:

- Vercel project domain config
- `NEXT_PUBLIC_SITE_URL`
- analytics config
- canonical/meta tags

## Vercel Domain Connection

In Vercel:

1. open project settings
2. add the custom domain
3. note the exact DNS values Vercel asks for

Typical patterns:

- `A` record for apex to Vercel IP if required by Vercel
- `CNAME` for `www` to Vercel alias if required

Always trust the exact values shown in Vercel at setup time.

## Cloudflare DNS Checklist

If Cloudflare manages DNS:

1. add the domain to Cloudflare if not already there
2. update nameservers at the registrar if migrating DNS to Cloudflare
3. create the Vercel-required records in Cloudflare DNS
4. choose proxied vs DNS-only based on Vercel guidance
5. wait for propagation

## SSL Expectations

- Vercel will provision SSL once the domain verifies
- Cloudflare Universal SSL may also be active if proxied
- verify that HTTPS works for both apex and `www`
- verify redirects do not create loops

## WWW / Non-WWW Redirect Rule

Decide one canonical host and redirect the other.

Recommended:

- `mallowmauve.in` → `https://www.mallowmauve.in`

## DNSSEC Note

If DNSSEC is enabled at the registrar or Cloudflare:

- confirm the DS records are correct after nameserver or DNS changes
- misconfigured DNSSEC can break verification and SSL issuance

## Propagation Note

DNS changes may take minutes or several hours depending on TTL and provider caching.

Do not declare launch complete until:

- Vercel verifies the domain
- SSL is active
- both desktop and mobile can reach the live site

## Final Verification

- homepage loads on final domain
- collection pages load
- product pages load
- admin login still works
- `/api/health` returns success
- PostHog records production hostname correctly
