---
"@equinor/fusion-framework-lint-lsp": patch
---

Internal: bump `vscode-languageserver` from `9.0.1` to `10.1.0`. Fixes a broken import caused by the package dropping the `/node.js` export subpath in favor of `/node` (no extension) — updated `src/server.ts` accordingly.
