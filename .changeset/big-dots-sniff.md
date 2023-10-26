---
'@equinor/fusion-framework-cli': patch
---

silent error when failing to optimize pre-built assets

Vite tries to import optimize pre-built assets for the dev portal (which it should not).

see [fix: exclude external dependencies from html rewriting](https://github.com/vitejs/vite/pull/11854#issuecomment-1500453147)
