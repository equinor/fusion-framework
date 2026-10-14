---
"@equinor/fusion-framework-docs": patch
---

Correct Roles V2 setup guidance: portal-hosted apps do not need to call `enableMSAL`. Explain automatic app auth registration, intentional custom-provider precedence, standalone bootstrap requirements, and why static Roles mocks cannot verify real-client authentication.

Refs #5723.
