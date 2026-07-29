---
"@equinor/fusion-framework-module-feature-flag": patch
---

Internal: fix the `./selectors` subpath export missing `findFeature` (it was moved to its own file in a previous lint cleanup but never re-exported). No breaking change — `findFeature` is available from `@equinor/fusion-framework-module-feature-flag/selectors` again.
