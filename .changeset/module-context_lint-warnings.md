---
"@equinor/fusion-framework-module-context": patch
---

Resolve fusion-lint warnings: add missing TSDoc (constructors, getters, setters, overload implementations, `@throws`/`@template` tags), add intent comments above control-flow and RxJS/iterator chains, and split multi-export files to satisfy `single-export-per-file`.

- Split `selectors.ts` into `query-context-selector.ts` and `related-context-selector.ts` (re-exported from `selectors.ts`), and extracted `parseContextItem` into `parse-context-item.ts`.
- Split `extractContextIdFromPath` out of `utils/resolve-context-from-path.ts` into `utils/extract-context-id-from-path.ts` (re-exported from the original file).
- Deferred work items are now tracked as GitHub issues #5115–#5122.
