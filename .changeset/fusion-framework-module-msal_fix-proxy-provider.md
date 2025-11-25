---
"@equinor/fusion-framework-module-msal": patch
---

Internal: fix proxy provider creation to avoid incorrect provider wiring in v2 `create-proxy-provider.ts`.

This change corrects internal wiring used when creating the proxy provider in the v2 implementation. No public API changes.
