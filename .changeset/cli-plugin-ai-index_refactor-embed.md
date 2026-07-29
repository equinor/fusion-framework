---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Internal: split the monolithic `embed()` bin function into focused helper functions (file streaming, parsing, metadata, embedding, and upserting stages) for readability and maintainability; no public API or behavior changes.
