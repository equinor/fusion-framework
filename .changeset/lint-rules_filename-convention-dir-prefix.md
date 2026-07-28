---
"@equinor/fusion-framework-lint-rules": patch
---

`filenameConvention` now accepts a file's immediate parent directory as an implicit namespace prefix — e.g. `require-intent-comment/flow.ts` exporting `requireIntentCommentFlow` is valid, since the directory name plus filename together spell out the export's kebab-case form. This matches a common and intentional pattern throughout the codebase (rule variants, per-endpoint generator modules, etc.) that was previously flagged as a false positive.
