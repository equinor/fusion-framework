---
"@equinor/fusion-framework-module-context": patch
---

Fix `ContextModule.postInitialize` logging a `console.warn` for the valid "no initial context" case (no context in the path and no parent context). The default `resolveInitialContext` resolver used RxJS `first()` without a default value, so completing with no emissions threw an `EmptyError` that got logged as if resolution had actually failed. `first()` now falls back to `undefined`, so a genuinely empty result completes silently and only real resolution failures are logged.
