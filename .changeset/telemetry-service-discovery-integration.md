---
"@equinor/fusion-framework-module-service-discovery": minor
---

This change enhances the module with telemetry capabilities while maintaining backward compatibility by making telemetry support optional.

**Added**
- Integrated with Fusion Framework telemetry module for performance monitoring and error tracking
- Added measurement of service resolution operations
- Added error tracking through telemetry
- Enhanced error handling with better contextual information

**Technical details**
- Added `@equinor/fusion-framework-module-telemetry` as an optional peer dependency
- Added automatic telemetry setup in the configurator when available
- Updated `ServiceDiscoveryConfig` interface to include optional telemetry property
- Added `setTelemetryProvider` method to the `ServiceDiscoveryConfigurator`
- Wrapped critical service operations with telemetry measurements

