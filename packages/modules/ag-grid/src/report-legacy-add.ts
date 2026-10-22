import {
  type ITelemetryProvider,
  TelemetryLevel,
} from '@equinor/fusion-framework-module-telemetry';
import { createDiagnosticContext } from '@equinor/fusion-framework-module-telemetry/utils';

const providersWithDeliveryFailures = new WeakSet<ITelemetryProvider>();

/**
 * Reports one use of the patched legacy `add()` as a safe operational notification.
 *
 * The notification has no measured duration, so it is an event rather than a fabricated
 * zero-duration metric. It carries only the versioned diagnostic envelope: no grid keys,
 * DOM references or theme data. `Warning` marks recoverable reliance on a compatibility shim.
 *
 * @param telemetry - Host telemetry provider owning the record's source identity.
 * @throws No errors escape; delivery failures are reported once as a console warning.
 */
export function reportLegacyAdd(telemetry: ITelemetryProvider): void {
  try {
    const source = telemetry.source;
    // Refuse to invent an origin for a provider without host identity.
    if (!source) {
      throw new Error('Operational telemetry requires host source identity');
    }
    telemetry.trackEvent({
      name: 'fusion.ag-grid.legacy-add',
      level: TelemetryLevel.Warning,
      // Matches the foundation's operational scope for built-in records.
      scope: source.source ? [source.source, 'operational'] : ['operational'],
      diagnostic: createDiagnosticContext({
        source,
        module: 'ag-grid',
        operation: 'legacy-add',
        outcome: 'success',
      }),
    });
  } catch {
    // Diagnostic delivery failures never reach AG Grid; report once per host provider.
    if (!providersWithDeliveryFailures.has(telemetry)) {
      providersWithDeliveryFailures.add(telemetry);
      console.warn('AG Grid compatibility telemetry delivery failed');
    }
  }
}
