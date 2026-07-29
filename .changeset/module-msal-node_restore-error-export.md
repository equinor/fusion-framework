---
"@equinor/fusion-framework-module-msal-node": patch
---

Internal: restore the `./error` subpath export. It broke when `error.ts` was split into individual files under `errors/` for `single-export-per-file` compliance without keeping a re-export at the original path. `error.ts` is now a barrel re-exporting `AuthServerError`, `AuthServerTimeoutError`, `NoAccountsError`, and `SilentTokenAcquisitionError` — no breaking change.
