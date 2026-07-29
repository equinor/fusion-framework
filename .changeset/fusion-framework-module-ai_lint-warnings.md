---
"@equinor/fusion-framework-module-ai": patch
---

Internal: resolve fusion-lint warnings across the AI module.

- Added intent comments above control-flow (`if`/`for`) blocks, iterator calls (`.map()`, `.some()`, `.every()`, `.find()`), and RxJS `.pipe()` chains that were missing them.
- Added missing `@returns` TSDoc on `AzureOpenAIModel.llm`, and `@throws` on `AzureVectorStore.addDocumentsWithSchemaFields`/`invoke`.
- Suppressed `single-export-per-file` for co-located helper consts (`module`, `enableAI`, and the three `createFusionAi*Strategy` factories) that aren't checked by `require-tsdoc`.

No public API changes.
