---
"@equinor/fusion-framework-module-msal": patch
---

Remove the `@equinor/fusion-framework-module-msal/v2` sub-path export. Its entry file was removed in the MSAL v4 upgrade, so the sub-path has failed to resolve since then; nothing that previously worked is removed.
