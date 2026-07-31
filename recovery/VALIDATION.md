# Reconstruction validation

This record summarizes validation of the editable source under
`reconstructed-source/`. It distinguishes verified local behaviour, the
public-snapshot comparison deployment, and the remaining Cloudflare-native
deployment step. It does not contain credentials, hashes, tokens, customer
records, or other private production data.

## Source coverage

| Check | Result |
| --- | --- |
| Local-HEAD indexed paths represented | 219/219 |
| Reconstructed files in total | 256 |
| Deployed-only media API routes restored | 3 |
| Indexed paths remaining as evidence-only skeletons | 0 |

Coverage is evidence-backed reconstruction coverage, not byte-identical source
recovery. The machine-readable report is
`source-reconstruction/coverage.json`.

## Build verification

| Check | Result |
| --- | --- |
| TypeScript (`npx tsc --noEmit`) | Pass |
| Next.js production build | Pass, 55 routes |
| OpenNext Cloudflare build | Pass |
| Wrangler upload dry-run | Pass |
| Static assets in dry-run | 331 |

The OpenNext output produced a single deployable Worker bundle with the
preview-only D1, R2, service, and asset bindings expected by
`wrangler.preview.jsonc`.

## Guarded smoke verification

The smoke suite ran locally with its explicit preview-only mutation
acknowledgement. It is designed to refuse `upderma.com` so its order and
administrative mutations cannot accidentally target production.

| Behaviour | Result |
| --- | --- |
| Authenticated administrative API routes | 12 passed |
| Authenticated backoffice pages | 15 passed |
| Coupon validation | Passed |
| Order creation | Passed |
| Payment verification transition | Passed |
| Shipment transition | Passed |
| Outbound email | Disabled |

All records created by this test were synthetic and isolated from production.

## Cloudflare preview status

The exact sanitized recovered Worker is deployed to isolated resources:

- Worker target `upderma-reconstruction-preview`
- D1 database `upderma-reconstruction-preview`
- R2 cache bucket `upderma-reconstruction-preview-exact-cache`
- R2 media bucket `upderma-reconstruction-preview-media`
- R2 static bucket `upderma-reconstruction-preview-assets`

The final Worker upload passed a secret scan and retained the preview-only
`JWT_SECRET` and `ADMIN_SETUP_KEY` bindings. No secret value was read or
committed.

The isolated D1 public-content counts now match production:

| Table | Production | Preview |
| --- | ---: | ---: |
| `products` | 4 | 4 |
| `pages` | 15 | 15 |
| `page_sections` | 163 | 163 |
| `content_blocks` | 145 | 145 |
| `site_settings` | 5 | 5 |

Only these public catalog/content tables were synchronized. The production
queries were SELECT-only and reported no database changes.

## Asset and browser parity

| Check | Result |
| --- | --- |
| Recovered public files present in isolated R2 | 274/274 |
| R2 ETag equals local MD5 | 274/274 |
| Recovered JavaScript chunks | 182, UTF-8 byte fidelity restored |
| Active public page records | 15/15 exact, including sections |
| Public product pages | 4/4 exact rendered DOM and titles |
| Full-page pixel checks | Homepage, catalog, delivery, refund, privacy, and terms exact |
| Editorial/landing pages | 5/5 exact rendered DOM, titles, and loaded-image metadata |
| Dermatologist review page | Exact DOM; all 4 portraits present with matching dimensions |
| Backoffice login screenshots | Byte-identical SHA-256 |
| Add to cart | Passed; count and “Added to Cart!” state observed |
| Authenticated core backoffice routes | 13/13 rendered |
| Dashboard statistics | Rendered after data load |
| Logout | Passed |
| Temporary smoke admin cleanup | Passed; zero rows remained |

The authenticated production backoffice was not entered. The live backoffice
comparison was limited to its public login surface, honoring the production
no-touch boundary.

The final immutable Worker version audited in a fresh browser cache was
`86e7e433-70b9-49dd-a6c6-2ed68bcd1493`. The permanent Worker URL remains
`https://upderma-reconstruction-preview.thedotcom.workers.dev`.

The static fallback remains available at
[upderma-recovery-preview.iamasifnawaz.chatgpt.site](https://upderma-recovery-preview.iamasifnawaz.chatgpt.site).

Production was not used as a smoke-test target. No production Worker, D1
database, R2 bucket, route, custom domain, secret, or data row was modified.

## Configuration boundary

`reconstructed-source/wrangler.preview.jsonc` now targets
`upderma-reconstruction-editable-preview`, not the exact parity Worker. This
prevents a normal editable-source deployment from replacing the recovered
runtime at `upderma-reconstruction-preview`.

See `PARITY-REPORT.md` for the final evidence and safety boundary.
