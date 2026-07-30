# UpDerma production recovery

This repository preserves the recoverable production state of
[`upderma.com`](https://upderma.com) after the original SSD and local Git data
were lost.

It is a recovery snapshot, not the original development repository. Cloudflare
retained the compiled OpenNext/Next.js Worker, static assets, D1 database, and
R2 bucket. The original TypeScript and TSX files, source maps, package lock,
commit history, and local documentation were not present in the deployment.

## Recovery result

| Item | Result |
| --- | --- |
| Cloudflare Worker | Frozen version 8 recovered |
| Server artifact | Sanitized deployable Worker included as `dist/worker.js.gz` |
| Static assets | 272 unique deployable files with no failed downloads |
| Public HTML evidence | 12 route snapshots |
| D1 schema | 57 table and index objects, schema only |
| Route inventory | 79 deployed pathnames and 40 original API source paths |
| Original source and Git history | Not recoverable from Cloudflare |

## Important security decision

The exact production bundle contained a Cloudflare API token that had been
embedded during the original build. The exact bundle is deliberately not
published here. `dist/worker.js.gz` is a sanitized copy with all three embedded
occurrences replaced.

Revoke or rotate that old Cloudflare API token before using this recovery in
production. See [SECURITY.md](SECURITY.md).

## Verify and restore the Worker

```bash
npm run verify:recovery
npm run recover:worker
```

This expands the sanitized artifact to `dist/worker.js` and verifies its
SHA-256 checksum.

## Cloudflare resources

- Worker: `upderma-hair-oil`
- Custom domain: `upderma.com`
- D1: `upderma-db`
- D1 ID: `1007d649-e862-4560-805a-11d00d3346f5`
- R2: `upderma-cache`
- Compatibility date: `2026-04-20`
- Build ID: `XpuGOxTMXraAKxrygeae6`

The live D1 database contains orders, customer contact details, subscribers,
admin password hashes, analytics, and email logs. Those records are not stored
in this public repository.

## Deploy carefully

Do not redeploy over the working production service until the required secrets
have been recreated and a database export has been stored securely.

```bash
npm run recover:worker
npx wrangler@4 secret put JWT_SECRET
npx wrangler@4 secret put ADMIN_SETUP_KEY
npx wrangler@4 secret put RESEND_API_KEY
npx wrangler@4 deploy
```

Read [recovery/DEPLOYMENT.md](recovery/DEPLOYMENT.md) before deploying.
