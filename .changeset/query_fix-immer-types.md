---
"@equinor/fusion-query": patch
---

Internal: fix TypeScript type errors with immer 11.1.3 recursive Draft types by using type assertions instead of castDraft for value assignments in cache reducer.
