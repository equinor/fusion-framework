import type { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { createOperationalRecords } from '../create-operational-records.js';
import type { TelemetryItem } from '../types.js';
import type { TelemetrySource } from '../diagnostic-context.js';

/**
 * Projects only terminal lifecycle events into allowlisted operational records.
 * Raw messages, arbitrary properties, errors, and dependency-wait chatter are never forwarded.
 * @param configurator - Lifecycle stream to observe, preferably before user configuration runs.
 * @param source - Immutable origin identity owned by the host.
 * @returns Terminal duration metrics and controlled failure exceptions.
 */
export const mapConfiguratorEvents = (
  configurator: Pick<IModulesConfigurator, 'event$'>,
  source: TelemetrySource = { source: 'framework', hostId: crypto.randomUUID() },
): Observable<TelemetryItem> => {
  // Project before buffering so raw lifecycle payloads never enter the diagnostic queue.
  return configurator.event$.pipe(
    mergeMap((event) => {
      const name = event.name.split('::').at(-1) ?? '';
      let module = 'host';
      let operation: 'initialize' | 'dispose';
      let outcome: 'success' | 'failure' = event.error ? 'failure' : 'success';
      // Only measured terminal boundaries belong to foundational operational telemetry.
      switch (name) {
        case 'ModuleConfigurator.module.initialized':
        case 'ModuleConfigurator.module.initializeError':
        case 'ModuleConfigurator.module.disposed':
        case 'ModuleConfigurator.module.disposeError': {
          const moduleName = event.properties?.moduleName;
          // Aggregate legacy errors cannot be attributed to an individual module.
          if (typeof moduleName !== 'string') {
            return [];
          }
          module = moduleName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
          // Reject dynamic labels rather than admitting paths or payloads into event names.
          if (!/^[a-z][a-z0-9-]*$/.test(module)) {
            console.warn('Unsupported module identifier in lifecycle telemetry');
            return [];
          }
          operation = name.includes('dispose') ? 'dispose' : 'initialize';
          break;
        }
        case 'ModuleConfigurator.host.initialized':
        case 'ModuleConfigurator.host.initializeError':
          operation = 'initialize';
          break;
        case 'ModuleConfigurator.modules.disposed':
          operation = 'dispose';
          outcome = event.properties?.failed ? 'failure' : 'success';
          break;
        default:
          return [];
      }
      // Zero is a valid measurement; missing or invalid timings cannot form a duration record.
      if (event.metric === undefined || !Number.isFinite(event.metric) || event.metric < 0) {
        return [];
      }
      return createOperationalRecords({
        source,
        module,
        operation,
        outcome,
        duration: event.metric,
      });
    }),
  );
};

export default mapConfiguratorEvents;
