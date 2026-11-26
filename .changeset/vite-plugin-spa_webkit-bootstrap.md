---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Select the SPA bootstrap path by detecting native `using` parsing and `Symbol.dispose`. Compatible browsers lazily load the original bootstrap; other browsers load a fallback while both paths share the same bootstrap and service-worker logic.
