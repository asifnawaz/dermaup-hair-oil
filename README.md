# UpDerma production recovery

This repository preserves the recoverable production state of
[`upderma.com`](https://upderma.com) after the original SSD and local Git data
were lost.

It began as a production-artifact snapshot. Cloudflare retained the compiled
OpenNext/Next.js Worker, static assets, D1 database, and R2 bucket. A later disk
carve also recovered an intact `codebase-memory-mcp` index of the local-only Git
HEAD. That index does not contain complete source bodies, but it preserves the
original paths, symbols, signatures, imports, calls, routes, and structural
relationships needed for evidence-backed reverse engineering.

## Recovery result

| Item | Result |
| --- | --- |
| Cloudflare Worker | Frozen version 8 recovered |
| Server artifact | Sanitized deployable Worker included as `dist/worker.js.gz` |
| Static assets | 272 unique deployable files with no failed downloads |
| Public HTML evidence | 12 route snapshots |
| D1 schema | 57 table and index objects, schema only |
| Route inventory | 79 deployed pathnames and 40 original API source paths |
| Local-only Git HEAD evidence | `0eed85e378fd65c75eaf90b9588a85d11de9f523` |
| Indexed source structure | 219 files, 2,024 nodes, 5,830 relationships |
| Editable reconstruction | 219/219 indexed paths represented; 256 reconstructed files in total |
| Deployment drift restored | 3 deployed-only media API routes |
| Build result | TypeScript, 55-route Next.js build, OpenNext build, and Wrangler dry-run pass |
| Hosted comparison | Public recovered snapshot deployed at [upderma-recovery-preview.iamasifnawaz.chatgpt.site](https://upderma-recovery-preview.iamasifnawaz.chatgpt.site) |

The editable application is under
[`reconstructed-source`](reconstructed-source). Complete original source bodies
did not survive, so the reconstructed files are evidence-backed equivalents
rather than byte-identical originals. Coverage details are recorded in
[`recovery/source-reconstruction/coverage.json`](recovery/source-reconstruction/coverage.json),
and the final validation record is in
[`recovery/VALIDATION.md`](recovery/VALIDATION.md).

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

## Verify the recovered local index

```bash
npm run verify:index
npm run analyze:source-drift
```

The byte-identical index exports are under
[`recovery/original-codebase-index`](recovery/original-codebase-index). Read
[`recovery/source-reconstruction/README.md`](recovery/source-reconstruction/README.md)
for the reconstruction evidence hierarchy and limitations.

## Cloudflare resources

The following values describe the recovered production deployment. They are
archived as inert evidence and are not selected by the reconstructed
application's package scripts.

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

## Isolated preview status

Preview-only Cloudflare resources were created for the reconstructed
application:

- Worker target: `upderma-reconstruction-preview`
- D1: `upderma-reconstruction-preview`
- R2 cache: `upderma-reconstruction-preview-cache`
- R2 media: `upderma-reconstruction-preview-media`

The preview D1 schema and public-only seed data were applied. The Cloudflare
connector authorized creation and database seeding but did not authorize the
final Worker upload. As a public visual-comparison fallback, the reconstructed
site was deployed separately at
[upderma-recovery-preview.iamasifnawaz.chatgpt.site](https://upderma-recovery-preview.iamasifnawaz.chatgpt.site).
That fallback serves the recovered public snapshot and is not connected to the
preview D1 or production data. Authenticated backoffice behaviour was therefore
validated only by the guarded local smoke suite. Production resources and
`upderma.com` were not modified.

All runnable scripts in `reconstructed-source/package.json` explicitly use
`wrangler.preview.jsonc`. The recovered production configurations are stored
only as text evidence under `recovery/config-evidence/`. Do not point the
preview configuration or scripts at production bindings.

Read [recovery/DEPLOYMENT.md](recovery/DEPLOYMENT.md) before deploying.
