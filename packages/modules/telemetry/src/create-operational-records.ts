import { context, trace } from '@opentelemetry/api';
import type { TelemetrySource } from './diagnostic-context.js';
import type { TelemetryItem, TelemetryMetric, TelemetryException } from './types.js';
import { TelemetryLevel, TelemetryType } from './static.js';

/** Safe terminal outcome inputs; raw operation data and errors are deliberately excluded. */
export interface OperationalRecordArgs {
  source: TelemetrySource;
  module: string;
  operation: string;
  outcome: 'success' | 'failure' | 'cancelled';
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
  // Static identifiers and finite measurements keep built-in schemas bounded and meaningful.
  if (
    !Number.isFinite(args.duration) ||
    args.duration < 0 ||
    !/^[a-z][a-z0-9-]*$/.test(args.module) ||
    !/^[a-z][a-z0-9-]*$/.test(args.operation)
  ) {
    throw new RangeError('Invalid operational telemetry duration or static identifier');
  }
  const span = trace.getSpanContext(context.active());
  // Capture origin and existing correlation before asynchronous enrichment or relaying.
  const diagnostic = {
    ...args.source,
    schemaVersion: 1 as const,
    module: args.module,
    operation: args.operation,
    outcome: args.outcome,
    occurredAt: Date.now(),
    unit: 'ms' as const,
    ...(span ? { traceId: span.traceId, spanId: span.spanId, traceFlags: span.traceFlags } : {}),
  };
  const name = `fusion.${args.module}.${args.operation}`;
  const level = args.outcome === 'failure' ? TelemetryLevel.Error : TelemetryLevel.Information;
  const metric: TelemetryMetric = {
    name: `${name}.duration`,
    type: TelemetryType.Metric,
    level,
    value: args.duration,
    scope: [args.source.source, 'operational'],
    diagnostic,
  };
  // Success and cancellation do not fabricate exception records.
  if (args.outcome !== 'failure') {
    return [metric];
  }
  const exception = new Error('Framework operation failed');
  exception.name = 'OperationalError';
  exception.stack = undefined;
  const failure: TelemetryException = {
    name: `${name}.failure`,
    type: TelemetryType.Exception,
    level,
    exception: Object.freeze(exception),
    scope: metric.scope,
    diagnostic,
  };
  return [metric, failure];
}
