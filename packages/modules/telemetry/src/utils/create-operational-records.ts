import type { TelemetryItem, TelemetryMetric, TelemetryException } from '../types.js';
import { TelemetryLevel, TelemetryType } from '../static.js';
import {
  createDiagnosticContext,
  type DiagnosticContextArgs,
} from './create-diagnostic-context.js';
import { operationalScope } from './operational-scope.js';

/** Safe terminal outcome inputs; raw operation data and errors are deliberately excluded. */
export interface OperationalRecordArgs extends DiagnosticContextArgs {
  /** Elapsed milliseconds; zero is a valid measurement. */
  duration: number;
}

/**
 * Creates a terminal duration and, on failure, a controlled exception without copying payloads.
 * @param args - Static operation identity, host identity, outcome, and elapsed milliseconds.
 * @returns One duration metric and at most one sanitized exception.
 * @throws {RangeError} When duration or static operation identifiers are invalid.
 * @example
 * ```ts
 * const records = createOperationalRecords({
 *   source: { source: 'app', hostId: crypto.randomUUID() },
 *   module: 'host', operation: 'initialize', outcome: 'success', duration: 0,
 * });
 * ```
 */
export function createOperationalRecords(args: OperationalRecordArgs): TelemetryItem[] {
  // A finite, non-negative measurement keeps duration metrics meaningful; zero is valid.
  if (!Number.isFinite(args.duration) || args.duration < 0) {
    throw new RangeError('Invalid operational telemetry duration');
  }
  // Capture origin and existing correlation before asynchronous enrichment or relaying.
  const diagnostic = createDiagnosticContext(args);
  const name = `fusion.${args.module}.${args.operation}`;
  // The measurement is not itself the error: its outcome marks a failure, and the exception
  // alone carries Error severity, so each failure counts once in error views.
  const metric: TelemetryMetric = {
    name: `${name}.duration`,
    type: TelemetryType.Metric,
    level: TelemetryLevel.Information,
    value: args.duration,
    scope: operationalScope(args.source),
    diagnostic,
  };
  // Success and cancellation do not fabricate exception records.
  if (args.outcome !== 'failure') {
    return [metric];
  }
  // The record name is built from validated static identifiers, so it is safe to name the
  // failed operation; the original error, message and stack are never copied.
  const exception = new Error(`${name} failed`);
  exception.name = 'OperationalError';
  exception.stack = undefined;
  const failure: TelemetryException = {
    name: `${name}.failure`,
    type: TelemetryType.Exception,
    level: TelemetryLevel.Error,
    exception: Object.freeze(exception),
    scope: metric.scope,
    diagnostic,
  };
  return [metric, failure];
}
