---
"@equinor/fusion-framework-module-telemetry": minor
---

Added `configureAdapter` method to `TelemetryConfigurator` for dynamic adapter configuration with dependency injection support.

The new method allows adapters to be configured using callback functions that can access module instances through `requireInstance`, enabling more flexible and powerful adapter setup patterns.

**Breaking Changes:**
- `setAdapter()` method now requires an explicit identifier parameter: `builder.setAdapter('adapter-name', adapter)`

**Note:** While this introduces breaking changes to the configurator API, we're treating this as a minor version bump since the telemetry module is still in active development and not yet widely adopted by consumers.

**Changes:**
- Fix RxJS observable chain in TelemetryConfigurator to properly resolve async adapters
- Optimize adapter accumulation using mutable accumulator pattern for better performance with many adapters
- Fix potential memory leaks by using proper shareReplay configuration with refCount: true
- Add `hasAdapter` method to check adapter existence without logging exceptions
- Update documentation level filter logic to use >= instead of <= for correct filtering behavior
- Update documentation to use setAdapter instead of non-existent addAdapter method
- Update `setAdapter` method to require explicit identifier parameter for consistency
- Add comprehensive documentation examples for multiple adapters with different identifiers
- Fix test cases to use correct adapter configuration format
- Update SPA bootstrap and related code to use proper adapter identifiers

**Migration:**

Update `setAdapter()` calls to include identifier parameter: `builder.setAdapter('adapter-name', adapter)`
