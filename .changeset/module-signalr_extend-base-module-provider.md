---
"@equinor/fusion-framework-module-signalr": patch
---

`SignalRModuleProvider` now extends `BaseModuleProvider` and exposes the package `version`, so enabling SignalR no longer emits `ModuleConfigurator.provider.invalidBase` and `ModuleConfigurator.provider.versionMissing` warnings. The provider also gains a `dispose()` method. The constructor signature is unchanged.

Resolves equinor/fusion-core-tasks#2389
