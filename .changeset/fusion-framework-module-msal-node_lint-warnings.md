---
"@equinor/fusion-framework-module-msal-node": patch
---

Internal: resolve `fusion-lint` warnings (`require-intent-comment`, `require-tsdoc`, `single-export-per-file`, `no-todo-without-issue`). Split the error class hierarchy in `error.ts` into individual files under `errors/` to resolve `single-export-per-file` without conflicting with TSDoc adjacency, added missing constructor/`@param`/`@returns` TSDoc, added intent comments to control-flow blocks, and referenced tracking issue #5097 for a `noExplicitAny` TODO.
