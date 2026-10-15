---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Correct the `FUSION_SPA_MSAL_MOCK` guidance: run CI and Playwright suites with `ffc app dev --mock`, and point service discovery at the mock server in direct Vite setups, because mock tokens are rejected by real Fusion services.
