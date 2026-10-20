/**
 * Utility functions for telemetry item processing and operational records.
 *
 * @remarks
 * Import from `@equinor/fusion-framework-module-telemetry/utils`, or use the `utils`
 * namespace exported from the package root.
 */
export { mapConfiguratorEvents } from './map-configurator-events.js';
export { mergeTelemetryItem } from './merge-telemetry-item.js';
export { applyMetadata } from './resolve-metadata.js';
export { createOperationalRecords } from './create-operational-records.js';
export type { OperationalRecordArgs } from './create-operational-records.js';
export { createDiagnosticContext } from './create-diagnostic-context.js';
export type { DiagnosticContextArgs } from './create-diagnostic-context.js';
