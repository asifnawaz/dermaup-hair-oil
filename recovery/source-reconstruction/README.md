# Source reconstruction

The original UpDerma repository was initialized locally, but its commits were
never pushed to GitHub. The last indexed local HEAD was:

```text
0eed85e378fd65c75eaf90b9588a85d11de9f523
```

The Git objects and complete TypeScript/TSX source bodies were lost with the
disk. Reconstruction therefore combines independent evidence instead of
claiming byte-for-byte recovery.

## Evidence hierarchy

1. The frozen Cloudflare Worker and public chunks are authoritative for the
   latest deployed executable behaviour.
2. `recovery/original-codebase-index/` is authoritative for the 219 paths,
   symbols, line ranges, signatures, imports, calls, and routes indexed from
   the local-only Git HEAD.
3. Public HTML snapshots, CSS, images, and browser chunks preserve the rendered
   storefront and client behaviour.
4. The recovered D1 schema preserves the deployed relational structure.

The source index and deployed Worker were captured from different points on
2026-07-22. There is no cryptographic commit-to-deployment link. Observable
drift includes:

- the administrative UI moved from `app/admin` to `app/backoffice`;
- checkout moved from the `(site)` route group to `(checkout)`;
- three media-management API routes were added to the deployed build.

See `source-drift.json` for the evidence-backed comparison.

## Final coverage

`coverage.json` records the completed editable reconstruction:

| Measure | Result |
| --- | ---: |
| Indexed paths | 219 |
| Indexed paths represented by reconstructed source | 219 |
| Reconstructed files in total | 256 |
| Deployed-only API routes | 3 |
| Indexed paths left as evidence-only skeletons | 0 |

The three deployed-only routes are the media collection, media item, and media
file APIs under `app/api/admin/media/`. They were absent from the older
local-HEAD index but present in the deployed Worker.

These counts measure path and implementation coverage. They do not change the
provenance limitation: most lost TypeScript and TSX bodies cannot be proven
byte-identical to the originals.

## Rules for reconstructed files

- Reconstructed files must be labelled as reconstructed.
- Indexed signatures and paths should be preserved when they still match the
  deployed behaviour.
- Deployed code wins where the local index and live Worker differ.
- Compiled module factories are evidence, not editable original source.
- Generated skeletons must never be described as recovered originals.
- No production database rows, secrets, or the compromised Cloudflare token
  may be copied into reconstructed source.

## Verification

```bash
npm run verify:index
npm run analyze:source-drift
npm run extract:live-modules
npm run verify:live-modules
npm run report:source-coverage
```

`verify:index` checks both checksum manifests, all graph references, declared
counts, path safety, the local HEAD provenance, and that none of the supplied
records falsely claims to contain a complete source body.

`extract:live-modules` deterministically maps and preserves the deployed
Webpack factories as non-executed evidence. `verify:live-modules` checks every
generated file against its byte count and SHA-256 checksum, confirms all mapped
project client and server entries were found, and confirms no captured factory
was invoked.

Application-level validation was also completed from `reconstructed-source/`:

```bash
npx tsc --noEmit
npm run build
npm run build:cloudflare
SMOKE_BASE_URL=http://127.0.0.1:3000 \
  SMOKE_ADMIN_EMAIL='<preview-only account>' \
  SMOKE_ADMIN_PASSWORD='<preview-only password>' \
  SMOKE_MUTATIONS_ACK=preview-only \
  npm run smoke:preview
```

The smoke command is deliberately guarded and refuses the production domain.
The placeholders must be supplied from private local configuration and must
never be committed. The suite passed against an isolated local environment,
covering 12 authenticated API routes, 15 backoffice routes, coupon validation,
order creation, payment verification, and shipping. See `../VALIDATION.md` for
the complete result and Cloudflare preview status.
