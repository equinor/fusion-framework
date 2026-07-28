---
"@equinor/fusion-framework-module-bookmark": patch
---

Internal: Resolve fusion-lint warnings across the module — added missing TSDoc `@throws`/`@template` tags and fixed stale parameter/return docs on `BookmarkProvider`'s public API, added intent comments for control-flow and RxJS `.pipe()` chains, and extracted `BookmarkProviderError` into its own file (re-exported from `BookmarkProvider.error.ts` for backwards compatibility).

Split the 421-line `BookmarkProvider.flows.ts` into one-handler-per-file modules under `bookmark-flows/*.ts` for maintainability.
