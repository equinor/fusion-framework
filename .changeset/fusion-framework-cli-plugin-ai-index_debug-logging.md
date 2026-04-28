---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Add verbose debug logging to the `ai index add` pipeline when `--debug` is active.

Debug output includes config/pattern details, skipped files, per-file chunk counts, embedding batch sizes, upsert document IDs, and git diff file listings.
