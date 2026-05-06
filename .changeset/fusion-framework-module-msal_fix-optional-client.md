---
"@equinor/fusion-framework-module-msal": patch
---

Make `client` field optional in MSAL config schema to prevent `ZodError` validation failures when the MSAL client has not yet been configured during local development.

Fixes: https://github.com/equinor/fusion/issues/840
