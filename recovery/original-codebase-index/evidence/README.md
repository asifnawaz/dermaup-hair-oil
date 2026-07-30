# Dermaup indexed source evidence

This directory contains line-attributed, parser-extracted evidence from the intact pre-loss Dermaup codebase index. It is more than a filename inventory, but it is **not complete source code**.

- Evidence records: 2369
- Files represented: 202
- Signatures: 804
- Leading comments/docstrings: 46
- Call-argument expression prefixes: 1519
- Sensitive-looking records excluded: 0

`SOURCE-EVIDENCE.jsonl` preserves file path, source line, symbol, extraction kind and SQLite row provenance. Expression prefixes may stop at the indexer's 120-character bound. These records must remain evidence/partial snippets and must not be renamed to `.ts` or `.tsx` or represented as original files.
