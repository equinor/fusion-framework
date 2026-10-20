import type { TelemetrySource } from '../schemas/diagnostic-context.js';

/**
 * Scope for built-in operational records: the host's own kind, when it classified itself,
 * followed by `operational`. Built-in records never inherit a provider's custom default scope.
 * @param source - Host identity captured by the composition root.
 * @returns The record scope.
 */
export function operationalScope(source: TelemetrySource): string[] {
  return source.source ? [source.source, 'operational'] : ['operational'];
}
