---
"@equinor/fusion-framework-module-widget": patch
---

`WidgetModuleProvider` now extends `BaseModuleProvider` and exposes the package `version`, so enabling the widget module no longer emits a `ModuleConfigurator.provider.versionMissing` warning. The constructor signature is unchanged.

Resolves equinor/fusion-core-tasks#2389
