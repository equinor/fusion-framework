---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Internal: add clarifying intent comments and split `utils/ts-doc/extractors.ts` into single-export `create-typescript-document.ts`, `extract-document-from-class-node.ts`, `extract-document-from-node.ts`, and `process-source-file.ts` modules; rename `utils/ts-doc/parser.ts` to `is-typescript-file.ts` to match its single export, re-exported from the existing barrel; no public API or behavior changes.
