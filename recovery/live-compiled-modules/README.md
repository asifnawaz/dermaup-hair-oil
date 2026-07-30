# Live compiled module evidence

This directory contains **compiled deployment evidence**, not the lost original TypeScript/TSX source.

The extraction used the sanitized `dist/worker.js`, the deployed RSC client-reference manifests embedded in that Worker, and the recovered public files under `public/_next/static/chunks`.

The public chunks were evaluated only inside an isolated `node:vm` context whose `webpackChunk_N_E.push` function records payloads. Captured Webpack module factory functions were converted to text but were never called. Server route-entry factories were sliced from the sanitized Worker and syntax-checked without execution.

- RSC manifest assignments: 78
- Project client mappings found: 37
- Project client mappings missing: 0
- Compiled server entries found: 43
- Compiled project server entries found: 40
- Additional metadata-loader server entries found: 3
- Compiled server entries missing: 0
- Captured factories executed: 0

`manifest.json` records source-path mappings, module IDs, declared and observed chunks, found/missing counts, syntax results, and SHA-256 checksums. `SHA256SUMS.tsv` covers every generated file except itself.
