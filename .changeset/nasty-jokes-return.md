---
"@equinor/fusion-framework-module-widget": patch
---

Added check to `Widget.getConfig` to ensure that `undefined` config should not be emitted,
since the return type is `Observable<WidgetConfig>`,
so should not be breaking changed.
All though this might has been emitting undefined before, this might break some code that relies on this behavior.
