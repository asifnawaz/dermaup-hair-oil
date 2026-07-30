# UpDerma editable source reconstruction

This directory is a functional, editable reconstruction of the UpDerma
Next.js application. The original local Git commit was never pushed and its
complete source bodies were lost. These files were rebuilt from:

- the recovered local source index at HEAD
  `0eed85e378fd65c75eaf90b9588a85d11de9f523`;
- exact non-executed module factories from the deployed Cloudflare Worker;
- recovered public chunks, CSS, images, route snapshots, and public page data;
- the deployed D1 schema and Cloudflare binding metadata.

Read [`RECOVERY-NOTES.md`](RECOVERY-NOTES.md) for confidence levels and known
inferences. The frozen sanitized deployment evidence lives one directory above
under `recovery/` and `dist/`.

## Local preview

```bash
npm ci
npm run db:migrate:local
npm run dev
```

`predev` creates an ignored `public/` link tree pointing at the recovered
assets. Local D1 state is isolated under `.wrangler/`.

Create a preview-only administrator through `/api/admin/setup`; do not reuse a
production password or database. Configure `JWT_SECRET` and
`ADMIN_SETUP_KEY` in a local environment file that is excluded from Git.

## Checks

```bash
npx tsc --noEmit
npm run build
```

After starting an isolated preview with synthetic data, the guarded smoke test
can exercise the public order flow and authenticated backoffice:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3000 \
SMOKE_ADMIN_EMAIL=preview-admin@example.invalid \
SMOKE_ADMIN_PASSWORD='preview-only-password' \
SMOKE_MUTATIONS_ACK=preview-only \
npm run smoke:preview
```

The smoke script refuses `upderma.com`. It creates synthetic coupon and order
records, so run it only against disposable local or preview resources.
