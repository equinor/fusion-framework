---
"@equinor/fusion-framework-module-widget": patch
---

Restore the `@equinor/fusion-framework-module-widget/errors.js` sub-path. It again exports `WidgetManifestLoadError`, `WidgetConfigLoadError`, and `WidgetScriptModuleError`; the entry file was lost when the error classes were split into separate files.
