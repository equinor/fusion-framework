import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import {
  createOperationalRecords,
  type OperationalRecordArgs,
} from './create-operational-records.js';

/**
 * Isolates optional telemetry delivery from business outcomes and reports failures once.
 * @param provider - Lazy provider resolution avoids startup dependency cycles.
 * @returns A reporter accepting only allowlisted terminal outcome inputs.
 * @throws No errors escape; invalid providers are reported once outside the export pipeline.
 */
export function createOperationalReporter(
  provider: () => ITelemetryProvider | undefined,
): (args: Omit<OperationalRecordArgs, 'source'> & { notification?: boolean }) => void {
  let reported = false;
  return (args) => {
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
      // Failure records pair the terminal measurement with one controlled exception.
      for (const record of createOperationalRecords({ ...args, source: target.source })) {
        // Existing cache notifications cannot truthfully claim a measured lookup duration.
        if (args.notification) {
          target.trackEvent({
            name: record.name.replace(/\.duration$/, ''),
            level: record.level,
            scope: record.scope,
            diagnostic: record.diagnostic,
          });
        } else {
          target.track(record);
        }
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
