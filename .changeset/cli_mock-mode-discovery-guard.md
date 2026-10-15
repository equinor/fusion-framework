---
"@equinor/fusion-framework-cli": patch
---

Refuse to start the dev server in mock mode when service discovery does not point at the mock server. A `dev-server.config` that overrides `api.serviceDiscoveryUrl` while `--mock` (or `FUSION_SPA_MSAL_MOCK`) is active now fails at startup with a clear error instead of sending mock tokens to real service discovery.
