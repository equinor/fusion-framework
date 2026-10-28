---
"@equinor/fusion-framework-module-telemetry": minor
---

Extend `createOperationalTelemetry` with allowlisted primitive properties, bounded measured
operations, observable measurement, end-time identity and independently owned child scopes.
Closing a handle cancels in-flight work exactly once and prevents late reporting. Export
shared cancellation/reason classification and safe static identity helpers.

Add optional `ITelemetryProvider.scope(module, options)` to obtain an already connected handle
without importing utilities. Existing custom providers remain compatible. Notification reports
also accept named severity levels, avoiding runtime enum imports in optional integrations.

Refs #5837.
