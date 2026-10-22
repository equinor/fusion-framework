/**
 * Utility functions for telemetry item processing and operational records.
 *
 * @remarks
 * Import from `@equinor/fusion-framework-module-telemetry/utils`.
 */
export { mapConfiguratorEvents } from './map-configurator-events.js';
export { mergeTelemetryItem } from './merge-telemetry-item.js';
export { applyMetadata } from './resolve-metadata.js';
export { createOperationalRecords } from './create-operational-records.js';
export type { OperationalRecordArgs } from './create-operational-records.js';
export { createDiagnosticContext } from './create-diagnostic-context.js';
export { createOperationalReporter } from './create-operational-reporter.js';
export type {
  OperationalReport,
  OperationalTelemetryTarget,
} from './create-operational-reporter.js';
export type { DiagnosticContextArgs } from './create-diagnostic-context.js';
