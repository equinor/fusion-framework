---
"@equinor/fusion-framework-module-msal": patch
---

Internal: resolve fusion-lint warnings across the package — added missing TSDoc (`@returns`, `@param`, `@throws`, `@template`) on public APIs, added intent comments above control-flow, `switch`, and RxJS/array chains, and split the v2-compatible `Logger` class out of `v2/types.ts` into `v2/Logger.ts` to satisfy the single-export-per-file rule. No public behavior changes; `Logger` remains available from `@equinor/fusion-framework-module-msal/v2`.

Two deferred TODOs now reference tracked issues: throwing when `MsalProvider.acquireToken` is called with empty scopes and no default scope (https://github.com/equinor/fusion-framework/issues/5113), and reconsidering the `MsalModule` proxy-provider fallback once all apps migrate to v4 (https://github.com/equinor/fusion-framework/issues/5114).
