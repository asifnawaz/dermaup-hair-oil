# Security notes

## Required token rotation

The recovered production Worker contained a hardcoded Cloudflare API token in
the compiled OpenNext environment object. It appeared three times in the exact
bundle. The value has been removed from the published artifact.

The old token should be revoked or rotated in Cloudflare before this recovery
is treated as production-ready. Do not reuse it in Wrangler configuration,
`.env`, `.dev.vars`, GitHub Actions, or another build.

## Secrets that must be recreated

The application references these runtime values:

- `JWT_SECRET`
- `ADMIN_SETUP_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `REPLY_TO_EMAIL`
- `WHATSAPP_API_TOKEN`

OpenNext also supports optional cache purge bindings:

- `CACHE_PURGE_ZONE_ID`
- `CACHE_PURGE_API_TOKEN`

Use `wrangler secret put` for secret values. Never commit `.dev.vars`, `.env`,
tokens, admin setup keys, or exported production databases.

## Data excluded from GitHub

This public repository intentionally excludes:

- admin credential rows and password hashes
- analytics events
- customer names, email addresses, phone numbers, and delivery addresses
- email logs
- orders, order items, and order activity
- subscriber records
- database exports

The included migration contains column definitions only.

