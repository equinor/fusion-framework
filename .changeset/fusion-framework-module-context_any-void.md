---
"@equinor/fusion-framework-module-context": patch
---

Internal: resolve `noExplicitAny`/`noConfusingVoidType` Biome warnings in `ContextConfigBuilder` and `ContextModuleConfigurator`'s `resolveInitialContext` callback type, using explanatory `biome-ignore` comments for load-bearing `any`/`void` usages. No public API or behavior change.
