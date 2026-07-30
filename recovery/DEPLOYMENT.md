# Recovered Cloudflare deployment

## What can be redeployed

The repository contains a sanitized copy of the exact compiled Worker from
Cloudflare version `07fa0712-d8ac-48b7-bc06-7be615555184`, plus the recovered
static asset directory and the observed binding configuration.

Run:

```bash
npm run verify:recovery
npm run recover:worker
```

Do not deploy until the old embedded Cloudflare token has been revoked and the
required secrets have been recreated.

## Required live bindings

| Binding | Type | Target |
| --- | --- | --- |
| `ASSETS` | Workers assets | `./public` |
| `DB` | D1 | `upderma-db` |
| `MEDIA_BUCKET` | R2 | `upderma-cache` |
| `NEXT_INC_CACHE_R2_BUCKET` | R2 | `upderma-cache` |
| `WORKER_SELF_REFERENCE` | Service | `upderma-hair-oil` production |

The custom domain `upderma.com` is currently attached directly to the Worker.
The `www.upderma.com` DNS record points to the apex domain.

## Database safety

The migration in `migrations/0001_recovered_schema.sql` is for rebuilding an
empty database only. Do not apply it to the live D1 database.

Export the live database before any deployment or schema work:

```bash
mkdir -p backups
npx wrangler@4 d1 export upderma-db \
  --remote \
  --output backups/upderma-db-$(date +%F).sql
```

Store that export in encrypted private storage. The `.gitignore` excludes the
backup path and common database files.

## Recovery limitations

Cloudflare stored production output, not the original repository. The
following items remain unavailable:

- original TypeScript and TSX formatting and filenames for UI pages
- reusable component boundaries before bundling
- source maps
- original `package.json` and lockfile
- tests, lint configuration, planning documents, and Git history
- original secret values

Use `recovery/route-inventory.json`, the client chunks, public HTML snapshots,
and the D1 schema as evidence when rebuilding editable source.

