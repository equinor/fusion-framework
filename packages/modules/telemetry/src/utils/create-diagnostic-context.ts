import { context, trace } from '@opentelemetry/api';
import type {
  DiagnosticContext,
  OperationalOutcome,
  TelemetrySource,
} from '../schemas/diagnostic-context.js';
import { operationalIdentifier } from '../schemas/operational-identifier.js';

/** Static identity of one operational outcome; payloads and raw errors are deliberately excluded. */
export interface DiagnosticContextArgs {
  /** Host identity captured by the composition root. */
  source: TelemetrySource;
  /** Static kebab-case module label, such as `http`, `navigation` or `host`. */
  module: string;
  /** Static kebab-case operation label, such as `request` or `initialize`. */
  operation: string;
  outcome: OperationalOutcome;
}

/**
 * Creates the safe, versioned `diagnostic` envelope for a built-in record.
 *
 * Use it for operational notifications that have no measured duration, such as navigation
 * or cache events; use `createOperationalRecords` for measured terminal outcomes. The envelope
 * captures occurrence time and the active OpenTelemetry span now, so later enrichment or
 * relaying cannot change where or when the outcome happened.
 *
 * @param args - Host identity and static operation identity.
 * @returns A diagnostic envelope that passes the strict diagnostic schema.
 * @throws {RangeError} When the source kind, module or operation is not a static identifier.
 * @example
 * ```ts
 * telemetry.trackEvent({
 *   name: 'Navigation::navigated',
 *   level: TelemetryLevel.Information,
 *   diagnostic: createDiagnosticContext({
 *     source: telemetry.source,
 *     module: 'navigation',
 *     operation: 'notification',
 *     outcome: 'success',
 *   }),
 * });
 * ```
 */
export function createDiagnosticContext(args: DiagnosticContextArgs): DiagnosticContext {
  const { source, module, operation, outcome } = args;
  // Host-defined labels are open-ended but must stay static identifiers; the kind is optional.
  const invalid = [source.source, module, operation].some(
    (label) => label !== undefined && !operationalIdentifier.safeParse(label).success,
  );
  // Reject before capture, so a dynamic label can never reach an exported record.
  if (invalid) {
    throw new RangeError('Invalid operational telemetry identifier');
  }
  const span = trace.getSpanContext(context.active());
  // Host identity first; the fixed envelope fields cannot be overridden by it.
  return {
    ...source,
    schemaVersion: 1,
    module,
    operation,
    outcome,
    occurredAt: Date.now(),
    unit: 'ms',
    // Correlate with the caller's active span only when one exists; never create spans.
    ...(span ? { traceId: span.traceId, spanId: span.spanId, traceFlags: span.traceFlags } : {}),
  };
}
