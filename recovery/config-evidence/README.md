# Production configuration evidence

These files preserve the recovered production-targeting Wrangler configuration
for forensic comparison only. Their `.txt` suffix is intentional so Wrangler
cannot select them as deployable configuration.

Do not rename or deploy these files. The only runnable configuration in the
editable reconstruction is `reconstructed-source/wrangler.preview.jsonc`, which
targets the isolated reconstruction preview resources.
