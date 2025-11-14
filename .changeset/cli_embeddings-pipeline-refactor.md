---
"@equinor/fusion-framework-cli": patch
---

Refactor `ai embeddings` command pipeline to improve performance and maintainability.

- Optimize file deletion with batch operations instead of one-by-one processing
- Improve RxJS stream handling with better separation of removed vs new/modified files
- Enhance result tracking to report deleted files and added document IDs
- Add clearer logging and comments throughout the pipeline
- Ensure deletions happen before additions using concat operator

No public API changes; internal improvements only.

