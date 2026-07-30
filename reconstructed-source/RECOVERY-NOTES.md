# Reconstructed project configuration

These files are a reconstruction, not the original source tree. They were
derived from the healthy codebase index, the deployed OpenNext Worker, recovered
Next static chunks, and the recorded Cloudflare deployment metadata.

## Confidence levels

### Confirmed by deployed artifacts

- Next.js is `15.5.20` (`globalThis.nextVersion` in the Worker).
- React and React DOM are
  `19.2.0-canary-0bdb9206-20250818` (the client and server renderers enforce
  this exact version).
- The embedded OpenNext core is `4.0.2`.
- Tailwind CSS is `4.3.2` (the emitted CSS license banner).
- Drizzle ORM is `0.36.4` (its OpenTelemetry tracer version).
- Resend is `4.8.0` (the emitted `resend-node` user agent).
- `next.config.ts` resolved with `output: "standalone"` and
  `images.unoptimized: true`.
- The Cloudflare Worker name, compatibility date and flags, D1 binding, both R2
  bindings, service binding, custom domain, asset binding and observability are
  recorded in the recovered deployment metadata.

### High-confidence reconstruction

- `open-next.config.ts` is byte-for-byte the 256-byte R2 cache template in the
  OpenNext documentation and matches the indexed original file size.
- `postcss.config.mjs` is byte-for-byte the 146-byte Tailwind PostCSS template
  and matches the indexed original file size.
- `tailwind.config.js` uses the custom colors and fallback font stacks emitted
  into the recovered production CSS. Its structure is inferred; it is not
  claimed as byte-for-byte original.
- `wrangler.toml` preserves the original indexed filename and section layout,
  but its runnable values now point only to the isolated preview resources.
  The live values confirmed by deployment evidence are retained separately as
  inert text under `../recovery/config-evidence/`.

### Inferred scaffolding

- The `@opennextjs/cloudflare` package version is set to `1.20.2`. The Worker
  proves OpenNext core `4.0.2`, which narrows the adapter to `1.19.9` through
  `1.20.2`; the exact adapter package version is not embedded.
- Versions for Radix UI, Tiptap, Lucide, Sonner, Zod, build tooling and type
  packages are compatible inferred ranges. Their use is proven by the compiled
  chunks or indexed component inventory, but exact versions are not recoverable.
- `package.json`, `tsconfig.json`, `next-env.d.ts`, `app/layout.tsx` and the
  shortened `app/globals.css` are functional scaffolding. The original complete
  bodies were not present in the surviving index.
- `drizzle.config.ts` uses the D1 HTTP driver and environment credentials. The
  original indexed file was 252 bytes, but its complete body did not survive.
- `components.json`, `.serena/project.yml`, and `Readme.md` preserve indexed
  paths with minimal functional scaffolding. Their original bodies did not
  survive and these replacements are not claimed as byte-for-byte originals.

## Security

No credential values from the production Worker are present here. Populate
secrets locally or with `wrangler secret put`; never commit real values to an
environment file.

The runnable `wrangler.toml` and `wrangler.preview.jsonc` both point only to the
isolated preview resources. All preview, upload, migration, and deploy scripts
explicitly select `wrangler.preview.jsonc`. The preview configuration now
references the preview-only D1 database created for validation. Production
configuration copies are archived as inert text in
`../recovery/config-evidence/`; they are not runnable defaults.

## Administrative and operations APIs

The administrative authentication, setup, users, orders, customers,
subscribers, analytics, and dashboard APIs were reconstructed from 19 exact
route-entry module factories captured from the deployed Worker. HTTP methods,
authentication and super-admin gates, validation schemas, status codes,
response shapes, D1 queries, R2 payment-proof reads, order activity logging,
and Resend success/failure handling follow the deployed modules.

`lib/email.ts` was recovered from deployed module `81929`. Its exported
signatures, environment keys, sender defaults, bilingual subject lines and
message copy, template selection, and Resend request/response behavior are
confirmed. The original TypeScript formatting and some presentational HTML
markup were normalized during decompilation, so the generated email HTML is
semantically equivalent rather than byte-for-byte identical.

Two deployed quirks are intentionally preserved:

- Updating an order can log the literal new order status as an activity action.
  The historical `OrderAction` type omits `pending`, although the route accepts
  that status.
- Customer search builds a D1 SQL fragment after escaping apostrophes, while
  limit and offset remain bound parameters. This reflects production behavior;
  a future hardening change should replace the fragment with fully bound search
  parameters.

## Checkout, thank-you, and public policy routes

The checkout and thank-you clients were decompiled from deployed client modules
`86764` and `98348`. Their corresponding server pages, layouts, loading UI,
dynamic page route, policy renderer, sitemap, robots metadata, and favicon
redirect come from exact route-entry module factories in the deployed Worker.
The surviving source index records checkout under the older
`app/(site)/checkout` path; the reconstruction uses the deployed
`app/(checkout)/checkout` route group, whose separate layout avoids the public
storefront chrome.

Policy pages still prefer D1 content exactly as production does. Their offline
fallback copy was refreshed from the later captured public-page snapshots so a
preview without the production database remains visually and textually close
to the currently deployed pages. This fallback-copy choice is inferred from
the snapshots rather than claimed as byte-for-byte original source.

The thank-you order summary preserves the deployed subtotal, delivery,
coupon-discount, and prepaid-discount inference used for historical order rows.
No production database, Worker, route, or secret was changed while recovering
these files.

## Public storefront and catalogue

The shared storefront shell, homepage client and CMS section switch, homepage
visual sections, cart/header/footer controls, product grid/card, and catalogue
route were reconstructed against exact deployed server/client module factories
(`61244`, `19176`, `56005`, `38068`, `7259`, `43702`, `36816`, `38163`, and
`78458`). The recovered CSS class lists, route filtering, language behavior,
cart events, metadata, and homepage section ordering are high-confidence
equivalents of the deployed application.

For previewing without production bindings, the homepage and catalogue read the
sanitized `data/public-snapshot-data.json` copy. This fallback contains only
values already rendered on public routes. Four testimonial cards are likewise
reconstructed from the public homepage render. When a D1 binding exists, the
routes retain the deployed behavior and prefer current database products,
settings, testimonial blocks, and page sections.

The original global `app/layout.tsx` and storefront
`app/(site)/layout.tsx` were separate: the global layout owned `<html>` and
`<body>`, while the site layout owned Header, main content, Footer, BackToTop,
and the WhatsApp control. This relationship is confirmed by deployed modules
`16953` and `61244`.

## Catalogue conversion and policy UI

`components/catalog/sticky-add-bar.tsx`,
`components/shared/exit-intent-popup.tsx`, and
`components/shared/policy-layout.tsx` were recovered from deployed client
modules `19025`, `77338`, and `27909`. Their DOM structure, Tailwind classes,
scroll/exit thresholds, bilingual copy, cart and subscriber payloads, analytics
events, and UI timing match the captured production chunks.

`components/catalog/order-bump.tsx` was present in the original source index
but absent from every captured live chunk, consistent with it having been
tree-shaken from the deployed routes. Its public-package filtering, cart
payload, analytics event, types, translation keys, and added-state behavior are
index-backed. Its surrounding card layout is an explicitly marked visual
reconstruction rather than claimed original source.

## Final reconstruction coverage

The final coverage report represents all 219 paths from the recovered
local-HEAD index with editable reconstructed source. The tree contains 256
reconstructed files in total because it also restores supporting scaffolding
and three media-management API routes found only in the deployed Worker:

- `app/api/admin/media/route.ts`
- `app/api/admin/media/[id]/route.ts`
- `app/api/admin/media/[id]/file/route.ts`

This is source-path coverage, not a claim that lost source bodies or formatting
were recovered byte for byte. Confidence remains governed by the evidence
levels above and by `../recovery/source-reconstruction/coverage.json`.

## Validation result

The reconstructed application passed:

- `npx tsc --noEmit`;
- the 55-route Next.js production build;
- the OpenNext Cloudflare build;
- a Wrangler upload dry-run, including 331 static assets; and
- the guarded local smoke suite against an isolated local database.

The guarded smoke suite authenticated against 12 administrative API routes and
rendered 15 backoffice routes. It also exercised coupon validation, order
creation, payment verification, and shipment state transition using synthetic
preview-only data. Outbound email was disabled.

The preview-only D1 schema and public seed were successfully applied to the
isolated Cloudflare preview database. Preview Worker upload was then blocked by
Cloudflare connector authorization, so remote browser comparison was not
performed. No production Worker, database, bucket, route, domain, secret, or
record was changed. See `../recovery/VALIDATION.md` for the test matrix and
remaining deployment step.
