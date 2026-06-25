---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Fix type export paths for `./bootstrap.js` and `./sw.js` so TypeScript resolves the published declarations correctly.

- Prevent broken type resolution when consuming the SPA bootstrap and service worker entrypoints.