/**
 * Identifies an exporter-owned request so operational instrumentation does not instrument its own exports.
 * Symbol properties survive object spreads without becoming HTTP headers or serialized payload fields.
 */
export const telemetryExportRequest: unique symbol = Symbol('fusion.telemetry-export-request');
