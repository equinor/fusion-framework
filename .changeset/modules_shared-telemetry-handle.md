---
"@equinor/fusion-framework-module-ai": patch
"@equinor/fusion-framework-module-ag-grid": patch
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-framework-module-widget": patch
"@equinor/fusion-framework-module-context": patch
"@equinor/fusion-framework-module-bookmark": patch
"@equinor/fusion-framework-module-state": patch
"@equinor/fusion-framework-module-feature-flag": patch
"@equinor/fusion-framework-module-navigation": patch
---

Internal: standardize optional telemetry wiring on `TelemetryConnectable` and replace
module-specific operational reporters with the shared telemetry handle where applicable.
Preserve record names, outcomes, summary properties, volume budgets and navigation's
explicit telemetry precedence. Optional peers remain lazily loaded, and disposed providers
cannot report late outcomes.

Refs #5837.
