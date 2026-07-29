---
"@equinor/fusion-framework-module-signalr": patch
---

Internal: resolve `fusion-lint` warnings (`require-intent-comment`, `require-tsdoc`, `single-export-per-file`, `no-todo-without-issue`). Split `SignalRConfigurator` into its own file, removed stale `eslint-disable` comments (repo uses Biome), and referenced tracking issue #5096 for a `BaseConfigBuilder` migration TODO.
