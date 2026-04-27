---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Fix SPA bootstrap portal template URL construction to normalize slash boundaries between `/portal-proxy`, `assetPath`, and `templateEntry`.

This avoids malformed entrypoint imports like `/portal-proxy//bundles/...` that can fail with unauthorized dynamic module fetches in dev-server scenarios where `spa.templateEnv.portal.proxy` is enabled.
