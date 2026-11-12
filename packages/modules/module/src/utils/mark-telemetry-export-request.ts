import { telemetryExportRequest } from './telemetry-export-request.js';

/**
 * Marks request options as exporter-owned so operational instrumentation skips the export itself.
 * The marker applies only to this request, not unrelated concurrent traffic.
 * @param init - Options forwarded through the export transport's request pipeline.
 * @returns A copy retaining request options with the telemetry export request marker.
 * @template T - Request options type.
 * @example
 * ```ts
 * client.fetch('/v1/logs', markTelemetryExportRequest({ method: 'POST', body }));
 * ```
 */
export function markTelemetryExportRequest<T extends object>(
  init: T,
): T & { [telemetryExportRequest]: true } {
  return { ...init, [telemetryExportRequest]: true };
}
