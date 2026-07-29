---
"@equinor/fusion-framework-module-ai": patch
"@equinor/fusion-framework-module-azure-identity": patch
"@equinor/fusion-framework-module-bookmark": patch
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-framework-module-context": patch
"@equinor/fusion-framework-module-feature-flag": patch
"@equinor/fusion-framework-module-navigation": patch
"@equinor/fusion-framework-module-services": patch
"@equinor/fusion-framework-module-telemetry": patch
"@equinor/fusion-framework-module-widget": patch
---

Internal: added missing intent comments ahead of non-obvious control flow, RxJS `.pipe()` chains, iterator calls, and multi-source object merges to comply with the `require-intent-comment` and `require-tsdoc` lint rules. Also removed dead duplicate files left over from an earlier refactor in `navigation` (`events.ts`, `navigated-event.ts`, `history.flows.ts` — all fully superseded by their split replacements) and renamed `bookmarks/schemas.ts` to `bookmarks/bookmark.schemas.ts` in `services` to match the `*.schemas.ts` filename convention. No public API changes.
