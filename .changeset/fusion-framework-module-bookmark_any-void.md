---
"@equinor/fusion-framework-module-bookmark": patch
---

Internal: resolve `noExplicitAny`/`noConfusingVoidType` Biome warnings in `enableBookmark`'s configurator widening, `BookmarkCreateArgs`/`BookmarkPayloadGenerator`'s generic defaults, and safely tighten `BookmarkModuleConfigurator`'s internal resolver method return types from `| void` to `| undefined`. No public API or behavior change.
