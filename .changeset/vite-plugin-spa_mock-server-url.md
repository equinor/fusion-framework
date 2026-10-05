---
"@equinor/fusion-framework-vite-plugin-spa": minor
---

Expose the mock server origin to the portal at runtime.

The SPA HTML now sets `window.FUSION_MOCK_SERVER_URL` from the `msal.mockServerUrl` template value, which `ffc app dev --mock` and `ffc app serve --mock` set. Portals use it to turn on mock-only behavior; the dev portal uses it to send analytics to the mock Monitor service. Without `--mock`, the value is the unreplaced `%FUSION_SPA_MSAL_MOCK_SERVER_URL%` placeholder, which is not a URL. Check that the value is an `http(s)` URL before relying on it.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2182
