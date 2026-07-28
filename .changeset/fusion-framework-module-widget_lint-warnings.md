---
"@equinor/fusion-framework-module-widget": patch
---

Internal: resolve fusion-lint warnings across the widget module.

- Added intent comments above control-flow (`if`/`switch`) blocks and RxJS `.pipe()` chains that were missing them.
- Added missing `@returns`/`@throws` TSDoc tags on the `Widget.state` getter and `WidgetModuleProvider`'s internal query methods.
- Split `WidgetConfigLoadError` and `WidgetScriptModuleError` out of `errors.ts` into their own files (re-exported from `errors.ts` to preserve the public `errors.js` subpath export), satisfying `single-export-per-file` while preserving existing TSDoc.
- Suppressed `single-export-per-file` for co-located helper consts (`module`, `defaultConfigEndpointBuilder`, `createDefaultClient`, `handleFetchConfig`, `handleImportWidget`) that aren't checked by `require-tsdoc`.
- Replaced the ad-hoc `Todo` comment in `utils.ts` with a reference to [#5099](https://github.com/equinor/fusion-framework/issues/5099).

No public API changes.
