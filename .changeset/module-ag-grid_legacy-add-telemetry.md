---
"@equinor/fusion-framework-module-ag-grid": minor
---

Report use of the legacy `add()` compatibility shim through host telemetry.

When the host has the telemetry module, the first call to the patched `agStyleInjectionState.grids.add()` in each host lifecycle emits one `fusion.ag-grid.legacy-add` warning event with the operational `diagnostic` envelope. Installing the shim records nothing, the event contains no grid data, and `add()` keeps setting the key and returning the map, even if telemetry fails. The module now disposes its provider, which stops this observation.

`@equinor/fusion-framework-module-telemetry` is a new optional peer dependency.

Refs #5081, #5806
