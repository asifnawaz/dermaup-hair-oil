# Recovered Cloudflare deployment evidence

This document describes the production artifact that was recovered. It is not
a production deployment runbook. The root production-targeting Wrangler
configuration and deploy script were removed from the runnable defaults. Exact
configuration values survive only as inert `.txt` evidence under
`config-evidence/`.

Use the editable application's explicit preview commands from
`../reconstructed-source/` for any reconstruction test:

```bash
npm run build:cloudflare
npm run deploy:preview
```

Those commands select `wrangler.preview.jsonc` and the isolated
`upderma-reconstruction-preview` resources.

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

## Observed live bindings

| Binding | Type | Target |
| --- | --- | --- |
| `ASSETS` | Workers assets | `./public` |
| `DB` | D1 | `upderma-db` |
| `MEDIA_BUCKET` | R2 | `upderma-cache` |
| `NEXT_INC_CACHE_R2_BUCKET` | R2 | `upderma-cache` |
| `WORKER_SELF_REFERENCE` | Service | `upderma-hair-oil` production |

These bindings describe the recovered production deployment and must not be
copied into the preview configuration. The custom domain `upderma.com` is
currently attached directly to the Worker.
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

Cloudflare stored production output, not the original repository. A recovered
codebase index now restores exact path, symbol, signature, import, call, and
route evidence for the local-only HEAD, but not source bodies. The following
items remain unavailable:

- byte-identical TypeScript and TSX bodies and formatting
- reusable component boundaries before bundling
- source maps
- original `package.json` and lockfile
- tests, lint configuration, planning documents, and Git history
- original secret values

Use `recovery/route-inventory.json`, the client chunks, public HTML snapshots,
and the D1 schema as evidence when rebuilding editable source.
