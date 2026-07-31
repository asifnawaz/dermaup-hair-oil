# Cloudflare recovery parity report

Date: 2026-07-31

This report records the final comparison between the live public site and the
isolated recovered preview. It contains no credentials, password hashes,
tokens, customer records, subscriber records, or other private production
data.

## Result

The sanitized recovered Cloudflare Worker version 8, recovered static bundle,
and public catalog/content data are running at:

`https://upderma-reconstruction-preview.thedotcom.workers.dev`

The final fresh-cache audit used immutable Worker version
`86e7e433-70b9-49dd-a6c6-2ed68bcd1493` at:

`https://86e7e433-upderma-reconstruction-preview.thedotcom.workers.dev`

All 15 active public pages and all four product pages matched the live titles
and rendered accessibility DOM exactly. Loaded image paths and natural
dimensions also matched; the only transient differences observed were live
recommendation images that had not lazy-loaded yet. Full-page pixel
comparisons were exact for the homepage, product catalog, delivery, refund,
privacy, and terms pages. The backoffice login screenshots had identical
SHA-256 hashes.

## Recovered runtime

- Production source artifact: fixed Worker version
  `07fa0712-d8ac-48b7-bc06-7be615555184`
- Embedded Cloudflare token occurrences removed before preview upload: 3
- Remaining known credential-pattern matches before upload: 0
- Preview secrets retained by binding type and never read: `JWT_SECRET`,
  `ADMIN_SETUP_KEY`
- Exact preview cache bucket:
  `upderma-reconstruction-preview-exact-cache`
- Corrected preview cache prefix: `utf8-v2`

The exact production bundle is not committed. The repository contains the
sanitized compressed artifact and the small deployed R2 routing wrapper.

## Static asset integrity

- Recovered files checked: 274
- Present in isolated R2: 274
- Local MD5 equal to R2 ETag: 274
- Missing: 0
- Mismatched: 0
- Recovered JavaScript chunks: 182

All JavaScript chunks were uploaded as decoded UTF-8 text so Urdu, curly
quotes, and other non-ASCII characters retain byte fidelity.

The final audit found and restored two public dermatologist portraits that
were referenced by the live page but absent from the original recovered tree:

| Asset | Bytes | MD5 / R2 ETag |
| --- | ---: | --- |
| `public/dermatologists/dr-faraz-ali.png` | 2,104,250 | `5213e4962f58634477f17b996d034248` |
| `public/dermatologists/dr-muneeb-shah.jpeg` | 64,735 | `1e3b8be820de92dacbebf45676c19f9a` |

## Public D1 content

Only public catalog/content tables were copied into the isolated preview.

| Table | Production | Preview |
| --- | ---: | ---: |
| `products` | 4 | 4 |
| `pages` | 15 | 15 |
| `page_sections` | 163 | 163 |
| `content_blocks` | 145 | 145 |
| `site_settings` | 5 | 5 |

Production query metadata reported `changed_db=false` and zero rows written.
Private orders, customers, subscribers, analytics, email logs, admin users,
and password hashes were not copied.

## Browser smoke tests

- Homepage, catalog, delivery, refund, privacy, and terms full-page screenshots
  were pixel-identical to the live site.
- All 15 public page records and sections matched production row-for-row.
- All four product pages matched live titles and full rendered DOM exactly.
- Product image paths and natural dimensions matched after lazy loading.
- The dermatologist review page matched exactly after restoring its two
  missing portrait assets.
- Urdu labels and non-ASCII punctuation render correctly on the corrected
  immutable Worker version.
- Add to cart changed the cart count to 1 and showed `Added to Cart!`.
- Backoffice login was byte-identical to the live public login screen.
- A random preview-only administrator was used to validate the authenticated
  dashboard and 12 additional core backoffice routes.
- Dashboard statistics and recent-order widgets rendered.
- Logout returned to the login screen.
- The temporary administrator was deleted; a follow-up query found zero rows.

Production backoffice credentials were not recovered, inspected, transmitted,
or used. The authenticated live backoffice was not entered.

## Production safety boundary

No production Worker, deployment, route, custom domain, DNS record, D1 row, R2
object, secret, or setting was modified. Production access was limited to
read-only Worker-version retrieval, public GET requests, and SELECT queries.

Temporary verification Workers are removed after testing. The retained
Cloudflare target is only `upderma-reconstruction-preview`.
