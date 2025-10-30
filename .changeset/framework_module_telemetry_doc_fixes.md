---
"@equinor/fusion-framework-module-telemetry": patch
---

Fix incorrect TSDoc examples in telemetry module documentation.

- Remove non-existent `setFilter` method references from TelemetryConfigurator documentation
- Fix exception examples to include required `exception` property
- Correct metric examples to have `value` at top level instead of in properties
- Update scope properties to use array format instead of single strings
- Improve formatting of trackException example for better readability
