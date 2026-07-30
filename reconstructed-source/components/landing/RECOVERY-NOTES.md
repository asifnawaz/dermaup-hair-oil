# Landing and product-detail recovery notes

This directory is editable reconstructed source, not a byte-for-byte copy of
the lost TSX.

High-confidence recovered behavior:

- `app/(site)/landing-client.tsx` follows the exact deployed section dispatch
  table captured from client module `34516`.
- All deployed product section types and all 36 landing component filenames
  from the surviving source index are present.
- Public product copy, section configuration, ordering, images, package prices,
  Urdu variants, reviews, ingredient blocks, FAQs, and related products come
  from the four captured live product-page RSC payloads.
- `lib/ingredient-icons.ts`, structured-data fields, metadata behavior, cart
  payload shape, and the product-page data query order were recovered from
  deployed modules.

Inferred implementation:

- Original component bodies were minified and split across lazy chunks. The
  reconstructed components preserve their public props, CMS-driven behavior,
  responsive section hierarchy, and primary interactions, but use clean new
  TSX rather than attempting to disguise compiled JavaScript as source.
- Animation choreography, exact carousel physics, minor decorative layers,
  and some original utility-class choices are approximations. These should be
  tuned from preview-versus-live screenshot comparisons.
- The indexed delivery-date helper family is retained in the product page for
  provenance, although the later deployed bundle did not visibly consume the
  generated delivery schedule.
