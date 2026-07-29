---
"@equinor/fusion-framework-module-analytics": patch
---

Internal: resolve fusion-lint warnings across the analytics module.

- Added intent comments above control-flow and RxJS `.pipe()` chains that were missing them.
- Added missing constructor and method TSDoc (including `@param`/`@returns` tags).
- Split `extractAppMetadata.ts` and `extractContextMetadata.ts` so each export lives in its own file, satisfying the `single-export-per-file` rule while preserving existing TSDoc.
- Replaced ad-hoc `@TODO` comments in `AnalyticsProvider` with references to [#5098](https://github.com/equinor/fusion-framework/issues/5098).

No public API changes.
