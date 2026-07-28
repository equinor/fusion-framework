---
"@equinor/fusion-framework-module-navigation": patch
"@equinor/fusion-framework-module-telemetry": patch
---

Internal: renamed 3 source files to comply with the `filename-convention` lint rule (`history.reducer.ts` → `create-history-reducer.ts`, and the two `adapter.ts` files in telemetry → `ApplicationInsightsAdapter.ts`/`ConsoleAdapter.ts`). No public API changes.
