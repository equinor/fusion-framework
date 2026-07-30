---
"@equinor/fusion-lint": patch
"@equinor/fusion-framework-lint-lsp": patch
"@equinor/fusion-framework-lint-config": patch
"@equinor/fusion-framework-lint-rules": patch
---

Internal: add missing TypeScript project `references` between the linting packages (`lint-core`, `lint-rules`, `lint-config`, `fusion-lint`, `lint-lsp`).

Without these references, `tsc -b` couldn't resolve `@equinor/fusion-framework-lint-core`/`lint-config` types when a package was built in isolation (as happens during `npm publish`'s `prepack` step), causing the previous release's publish to fail partway through.
