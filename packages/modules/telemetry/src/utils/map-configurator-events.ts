import type { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { ModuleConfiguratorEventName } from '@equinor/fusion-framework-module/configurator';
import { createOperationalRecords } from './create-operational-records.js';
import type { TelemetryItem } from '../types.js';
import type { TelemetrySource } from '../schemas/diagnostic-context.js';
import { operationalIdentifier } from '../schemas/operational-identifier.js';

/** A measured lifecycle boundary that produces one terminal operational outcome. */
interface TerminalBoundary {
  operation: 'initialize' | 'dispose';
  /** Module boundaries are attributed to the module; others to the host itself. */
  perModule: boolean;
  /** Error boundaries always fail, even when the rejection reason itself is falsy. */
  failure: boolean;
}

/**
 * Allowlist of terminal lifecycle events. Every other event, including dependency waits and
 * configuration chatter, is dropped rather than projected.
 */
const terminalBoundaries: ReadonlyMap<string, TerminalBoundary> = new Map([
  [
    ModuleConfiguratorEventName.ModuleInitialized,
    { operation: 'initialize', perModule: true, failure: false },
  ],
  [
    ModuleConfiguratorEventName.ModuleInitializeError,
    { operation: 'initialize', perModule: true, failure: true },
  ],
  [
    ModuleConfiguratorEventName.ModuleDisposed,
    { operation: 'dispose', perModule: true, failure: false },
  ],
  [
    ModuleConfiguratorEventName.ModuleDisposeError,
    { operation: 'dispose', perModule: true, failure: true },
  ],
  [
    ModuleConfiguratorEventName.HostInitialized,
    { operation: 'initialize', perModule: false, failure: false },
  ],
  [
    ModuleConfiguratorEventName.HostInitializeError,
    { operation: 'initialize', perModule: false, failure: true },
  ],
  [
    ModuleConfiguratorEventName.ModulesDisposed,
    { operation: 'dispose', perModule: false, failure: false },
  ],
]);

/**
 * Projects only terminal lifecycle events into allowlisted operational records.
 * Raw messages, arbitrary properties, errors, and dependency-wait chatter are never forwarded.
 * @param configurator - Lifecycle stream to observe, preferably before user configuration runs.
 * @param source - Host identity, or a lookup into the owning configuration before each record is captured.
 * @returns Terminal duration metrics and controlled failure exceptions.
 */
export const mapConfiguratorEvents = (
  configurator: Pick<IModulesConfigurator, 'event$'>,
  source: TelemetrySource | (() => TelemetrySource) = { hostId: crypto.randomUUID() },
): Observable<TelemetryItem> => {
  // Project before buffering so raw lifecycle payloads never enter the diagnostic queue.
  return configurator.event$.pipe(
    mergeMap((event) => {
      // Hosts prefix event names with their class name; the boundary is the unprefixed name.
      const boundary = terminalBoundaries.get(event.name.split('::').at(-1) ?? '');
      // Only measured terminal boundaries belong to foundational operational telemetry.
      if (!boundary) {
        return [];
      }
      // Zero is a valid measurement; missing or invalid timings cannot form a duration record.
      if (event.metric === undefined || !Number.isFinite(event.metric) || event.metric < 0) {
        return [];
      }
      let module = 'host';
      // Module boundaries are attributed to a static, kebab-case module label.
      if (boundary.perModule) {
        const moduleName = event.properties?.moduleName;
        // Aggregate legacy errors cannot be attributed to an individual module.
        if (typeof moduleName !== 'string') {
          return [];
        }
        module = moduleName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        // Reject dynamic labels rather than admitting paths or payloads into record names.
        if (!operationalIdentifier.safeParse(module).success) {
          console.warn('Unsupported module identifier in lifecycle telemetry');
          return [];
        }
      }
      return createOperationalRecords({
        source: typeof source === 'function' ? source() : source,
        module,
        operation: boundary.operation,
        // Error boundaries fail by kind; host disposal isolates module failures and reports `failed`.
        outcome: boundary.failure || event.properties?.failed ? 'failure' : 'success',
        duration: event.metric,
      });
    }),
  );
};

export default mapConfiguratorEvents;
