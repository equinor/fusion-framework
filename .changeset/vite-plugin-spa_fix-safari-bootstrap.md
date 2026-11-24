---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Replace ECMAScript `using` declarations in the SPA bootstrap and service worker registration with explicit `try / finally` measurement cleanup and target `ES2022` in `tsconfig.json`, fixing a parse-time `SyntaxError` in Safari and macOS WebKit (`WKWebView`).

Fixes: https://github.com/equinor/fusion-core-tasks/issues/3213
