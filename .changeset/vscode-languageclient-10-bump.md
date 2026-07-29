---
"fusion-ts-lint-vscode": patch
---

Internal: bump `vscode-languageclient` from `9.0.1` to `10.1.0`. Fixes a type error caused by the new version requiring a `LogOutputChannel` for `traceOutputChannel` — now created via `window.createOutputChannel(name, { log: true })`.
