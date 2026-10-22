import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';
import { TelemetryLevel } from '../static.js';
import {
  createDiagnosticContext,
  type DiagnosticContextArgs,
} from './create-diagnostic-context.js';
import {
  createOperationalRecords,
  type OperationalRecordArgs,
} from './create-operational-records.js';
import { operationalScope } from './operational-scope.js';

/**
 * One outcome reported by an optional integration; the host identity comes from the provider.
 * Measured outcomes carry a `duration`. Notifications have no measured boundary, so they are
 * recorded as events rather than as fabricated zero-duration metrics.
 */
export type OperationalReport =
  | Omit<OperationalRecordArgs, 'source'>
  | (Omit<DiagnosticContextArgs, 'source'> & { notification: true });

/**
 * Isolates optional telemetry delivery from business outcomes and reports failures once.
 * @param provider - Lazy provider resolution avoids startup dependency cycles.
 * @returns A reporter accepting only allowlisted outcome inputs.
 * @throws No errors escape; invalid providers are reported once outside the export pipeline.
 */
export function createOperationalReporter(
  provider: () => ITelemetryProvider | undefined,
): (report: OperationalReport) => void {
  let reported = false;
  return (report) => {
    try {
      const target = provider();
      // Optional telemetry must not impose a dependency on business operations.
      if (!target) {
        return;
      }
      // Refuse ambiguous ownership rather than inventing a source for a custom provider.
      if (!target.source) {
        throw new Error('Operational telemetry requires host source identity');
      }
      const source = target.source;
      // Notifications have no measured duration, so they are events with the same envelope.
      if ('notification' in report) {
        target.trackEvent({
          name: `fusion.${report.module}.${report.operation}`,
          level: report.outcome === 'failure' ? TelemetryLevel.Error : TelemetryLevel.Information,
          scope: operationalScope(source),
          diagnostic: createDiagnosticContext({ ...report, source }),
        });
        return;
      }
      // Failure records pair the terminal measurement with one controlled exception.
      for (const record of createOperationalRecords({ ...report, source })) {
        target.track(record);
      }
    } catch {
      // Delivery failures are diagnostic health, never recursive exported exceptions.
      if (!reported) {
        reported = true;
        console.warn('Operational telemetry delivery failed');
      }
    }
  };
}
