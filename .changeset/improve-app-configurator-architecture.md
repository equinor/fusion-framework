---
"@equinor/fusion-framework-app": patch
---

Improve AppConfigurator architecture and error handling

This patch includes several improvements to the AppConfigurator class and overall application module infrastructure for better reliability and developer experience.

**Note**: These changes were originally out of scope for the current state module task, but were included as they had been in TODO status for an extended period and were addressed while making the necessary architectural changes.

### Bug Fixes & Improvements

- **Enhanced Error Handling**: Added `AppConfiguratorError` class with contextual error information
- **Immutable Manifest**: Application manifest is now deeply frozen to prevent accidental mutations
- **Event System**: Added comprehensive event system with `AppModulesConfiguredEvent` and `AppModulesInitializedEvent`
- **Type Safety**: Improved TypeScript definitions with proper generic constraints and constructor types
- **Service Client Configuration**: Enhanced `useFrameworkServiceClient` with better error handling and type safety
- **Utility Functions**: Added deep cloning and freezing utilities for object immutability
- **Documentation**: Extensive JSDoc improvements with examples and detailed parameter descriptions
- **Module Configuration**: Enhanced configurator with better lifecycle management and dependency injection support

### Technical Changes

- Added `lodash.clonedeep` dependency for reliable deep cloning
- Restructured exports for better tree-shaking and module resolution
- Enhanced constructor signature to accept optional framework reference
- Improved module initialization flow with proper event dispatching
- Added comprehensive validation for service discovery operations

These changes provide a more robust foundation for application module configuration while maintaining backward compatibility.
