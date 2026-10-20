import { diagnosticExclusion } from './diagnostic-exclusion.js';

/**
 * Marks an exporter-owned request without suppressing unrelated concurrent operations.
 * @param request - Options forwarded through a transport's request pipeline.
 * @returns A copy retaining request options and an internal diagnostic exclusion marker.
 * @template T - Request options type.
 * @example
 * ```ts
 * client.fetch('/v1/logs', excludeDiagnostics({ method: 'POST', body }));
 * ```
 */
export function excludeDiagnostics<T extends object>(
  request: T,
): T & { [diagnosticExclusion]: true } {
  return { ...request, [diagnosticExclusion]: true };
}
