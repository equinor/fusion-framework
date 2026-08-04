---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Forward the original request's `cache` mode when the service worker re-fetches a proxied request. Previously a caller requesting `cache: 'no-store'` (e.g. a polling endpoint) would silently fall back to the default HTTP cache once passed through the service worker.
