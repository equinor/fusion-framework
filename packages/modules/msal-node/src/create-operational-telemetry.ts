import type {
  ITelemetryProvider,
  TelemetryLevel,
} from '@equinor/fusion-framework-module-telemetry';
import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';
import {
  createDiagnosticContext,
  createOperationalRecords,
} from '@equinor/fusion-framework-module-telemetry/utils';

/**
 * One safe operational outcome. Measured outcomes carry a `duration`; notifications have no
 * measured boundary and carry the severity of the condition they describe instead.
 */
export type OperationalTelemetryReport =
  | { operation: string; outcome: OperationalOutcome; duration: number }
  | { operation: string; outcome: OperationalOutcome; level: TelemetryLevel };

/**
 * Creates an isolated reporter for this module's built-in operational records.
 *
 * Records use the shared `fusion.<module>.<operation>` contract and never carry arguments,
 * payloads, identifiers or original errors. Delivery failures never reach the business
 * operation and are reported once as a sanitized console warning.
 *
 * @param module - Static kebab-case module label.
 * @param provider - Lazy telemetry lookup; `undefined` records nothing.
 * @returns Reporter accepting only allowlisted outcome inputs.
 */
export function createOperationalTelemetry(
  module: string,
  provider: () => Pick<ITelemetryProvider, 'source' | 'track' | 'trackEvent'> | undefined,
): (report: OperationalTelemetryReport) => void {
  let warned = false;
  return (report) => {
    try {
      const telemetry = provider();
      const source = telemetry?.source;
      // Without a host identity there is no safe envelope; custom providers are left untouched.
      if (!telemetry || !source) {
        return;
      }
      const { operation, outcome } = report;
      // Notifications describe a condition, so they are events rather than zero-length metrics.
      if ('level' in report) {
        telemetry.trackEvent({
          name: `fusion.${module}.${operation}`,
          level: report.level,
          scope: source.source ? [source.source, 'operational'] : ['operational'],
          diagnostic: createDiagnosticContext({ source, module, operation, outcome }),
        });
        return;
      }
      // A failure pairs its measurement with one controlled exception; both are delivered.
      for (const record of createOperationalRecords({ ...report, source, module })) {
        telemetry.track(record);
      }
    } catch {
      // Diagnostics must never become a business failure or a recursive export.
      if (!warned) {
        warned = true;
        console.warn(`Operational telemetry delivery failed for ${module}`);
      }
    }
  };
}
