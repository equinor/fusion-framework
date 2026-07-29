---
"@equinor/fusion-framework-lint-rules": patch
---

`single-export-per-file` no longer counts `enum` declarations toward the export limit. Enums are commonly grouped with the related types they describe (e.g. in a `types.ts` file) and shouldn't force a file split on their own.
