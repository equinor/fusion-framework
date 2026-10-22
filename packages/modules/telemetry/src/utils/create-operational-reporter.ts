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
  | (Omit<DiagnosticContextArgs, 'source'> & {
      notification: true;
      /**
       * Severity of the condition the notification describes. Defaults to `Error` for a
       * `failure` outcome and `Information` otherwise; use `Warning` for a recoverable
       * degradation, such as serving a fallback instead of failing.
       */
      level?: TelemetryLevel;
    });

/** Provider members the reporter uses, so callers can pass a narrowed provider. */
export type OperationalTelemetryTarget = Pick<
  ITelemetryProvider,
  'source' | 'track' | 'trackEvent'
>;

/**
 * Creates a reporter for a module's built-in operational outcomes.
 *
 * Each measured report becomes one `fusion.<module>.<operation>.duration` metric, plus one
 * sanitized `.failure` exception on failure; each notification becomes one
 * `fusion.<module>.<operation>` event. Records carry only the safe `diagnostic` envelope and
 * the provider's host identity, never arguments, payloads or original errors.
 *
 * The provider is resolved on every report, so a module can connect telemetry after
 * initialization and disconnect it on teardown by returning `undefined`. Telemetry is
 * optional: without a provider nothing is recorded. Delivery failures, including a custom
 * provider without host `source` identity, never reach the business operation and produce
 * one sanitized console warning per reporter.
 *
 * @param provider - Lazy provider resolution avoids startup dependency cycles.
 * @returns A reporter accepting only allowlisted outcome inputs.
 * @throws No errors escape; invalid providers are reported once outside the export pipeline.
 * @example
 * ```ts
 * import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';
 * import { createOperationalReporter } from '@equinor/fusion-framework-module-telemetry/utils';
 *
 * let telemetry: ITelemetryProvider | undefined; // connected after initialization
 * const report = createOperationalReporter(() => telemetry);
 *
 * const started = performance.now();
 * try {
 *   await exportReport();
 *   report({ module: 'reports', operation: 'export', outcome: 'success', duration: performance.now() - started });
 * } catch (error) {
 *   report({ module: 'reports', operation: 'export', outcome: 'failure', duration: performance.now() - started });
 *   throw error;
 * }
 *
 * // A recoverable degradation without a measured boundary.
 * report({ module: 'reports', operation: 'fallback', outcome: 'success', notification: true, level: TelemetryLevel.Warning });
 * ```
 */
export function createOperationalReporter(
  provider: () => OperationalTelemetryTarget | undefined,
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
          level:
            report.level ??
            (report.outcome === 'failure' ? TelemetryLevel.Error : TelemetryLevel.Information),
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
