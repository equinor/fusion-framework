---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Add comprehensive telemetry integration to SPA bootstrap and service worker.

- Enable telemetry in SPA bootstrap with ConsoleAdapter
- Add configurable console logging levels via FUSION_SPA_TELEMETRY_CONSOLE_LEVEL environment variable
- Track bootstrap performance for portal loading operations
- Monitor service worker registration and token acquisition
- Include user metadata and portal configuration in telemetry
- Track exceptions and errors throughout SPA lifecycle
- Fix console level filtering logic to properly respect environment variable settings

**Implementation Notes:**
- Console level filtering defaults to `TelemetryLevel.Information` (1) when env var not set
- Invalid env var values fallback to logging all telemetry (robust error handling)
- Backward compatible: existing behavior unchanged when no FUSION_SPA_TELEMETRY_CONSOLE_LEVEL specified
- Telemetry level mapping: 0=Debug, 1=Information, 2=Warning, 3=Error, 4=Critical

resolves: [#3487](https://github.com/equinor/fusion-framework/issues/3487)