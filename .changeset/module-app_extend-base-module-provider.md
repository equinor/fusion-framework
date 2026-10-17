---
"@equinor/fusion-framework-module-app": patch
---

Internal: `AppModuleProvider` now extends `BaseModuleProvider` instead of declaring its own `version` getter. `version` still returns the package version and the constructor signature is unchanged.

Resolves equinor/fusion-core-tasks#2389
