/**
 * Re-exports for OTLP log exporters used by analytics adapters.
 *
 * @remarks
 * Import from `'@equinor/fusion-framework-module-analytics/logExporters'`.
 *
 * @packageDocumentation
 */
export { FusionOTLPLogExporter } from './fusionOTLPLogExporter/FusionOTLPLogExporter.js';
export { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
