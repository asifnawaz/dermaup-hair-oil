# Reconstruction validation

This record summarizes validation of the editable source under
`reconstructed-source/`. It distinguishes verified local behaviour from the
remaining remote deployment step and does not contain credentials, hashes,
tokens, customer records, or other private production data.

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

The following isolated preview resources were created:

- Worker target `upderma-reconstruction-preview`
- D1 database `upderma-reconstruction-preview`
- R2 cache bucket `upderma-reconstruction-preview-cache`
- R2 media bucket `upderma-reconstruction-preview-media`

The preview D1 migrations and public-only seed completed successfully. The
Cloudflare connector then rejected authorization for the Worker upload, so the
remote preview was not deployed and a browser side-by-side comparison with
`upderma.com` could not be completed.

Production was not used as a smoke-test target. No production Worker, D1
database, R2 bucket, route, custom domain, secret, or data row was modified.

## Configuration boundary

`reconstructed-source/wrangler.preview.jsonc` is the only runnable default used
by the reconstructed application's migration, preview, upload, and deployment
scripts. Recovered production configurations are retained only as inert `.txt`
evidence under `recovery/config-evidence/`.

To finish remote validation, an authorized Cloudflare deployment session must
upload the already validated OpenNext build to the preview Worker target. Run
the guarded smoke suite and visual comparison against that preview URL before
considering any separate production change.
