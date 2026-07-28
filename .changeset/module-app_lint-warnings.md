---
"@equinor/fusion-framework-module-app": patch
---

Internal: Resolve fusion-lint warnings across the module — added missing TSDoc comments (including `@inheritdoc` for `IApp` interface implementations), added intent comments for control-flow and RxJS `.pipe()` chains, and referenced tracking issues for existing TODOs (#5123-#5133).

Split multi-export files into one-symbol-per-file modules for maintainability: `errors.ts` into `errors/*.ts`, `app/flows.ts` into `app/flows/*.ts`, and extracted the `filterEmpty` operator from `app/App.ts` into `app/filter-empty.ts` (re-exported from `App.ts` for backwards compatibility).
