---
"@equinor/fusion-framework-module-ag-grid": patch
---

`AgGridProvider` now extends `BaseModuleProvider` and exposes the package `version`, so enabling AG Grid in a portal or app no longer emits `ModuleConfigurator.provider.invalidBase` and `ModuleConfigurator.provider.versionMissing` warnings. The provider also gains a `dispose()` method. The constructor signature is unchanged.

Resolves equinor/fusion-core-tasks#2389
