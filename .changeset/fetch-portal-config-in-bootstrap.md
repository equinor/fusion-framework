---
"@equinor/fusion-framework-vite-plugins-spa": patch
---

Fetch and pass portal config to portal render function in bootstrap.ts

- The SPA bootstrap script now fetches the portal config from `/portals/{portalId}@{portalTag}/config` and passes it as `config` to the portal's render function.
- This enables portals to receive their runtime configuration directly at startup.
