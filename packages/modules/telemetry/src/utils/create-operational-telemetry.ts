import { operationalIdentifier } from '../schemas/operational-identifier.js';
import {
  createOperationalReporter,
  type OperationalReport,
  type OperationalTelemetryTarget,
} from './create-operational-reporter.js';

/** Removes a key from each member of a union, keeping the measured/notification split. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * One outcome reported through an {@link OperationalTelemetry} handle. The module label is
 * bound by the handle, so a report names only the operation, outcome and either a measured
 * `duration` or `notification: true` with an optional `level`.
 */
export type OperationalTelemetryReport = DistributiveOmit<OperationalReport, 'module'>;

/**
 * Connectable handle a module owns for its built-in operational telemetry.
 *
 * Create one per provider, connect it once a telemetry provider is available, report outcomes
 * through it, and disconnect it from the provider's teardown.
 */
export interface OperationalTelemetry {
  /** Static kebab-case module label used in every record name. */
  readonly module: string;
  /** Whether reports are currently delivered to a telemetry provider. */
  readonly connected: boolean;
  /**
   * Connects, replaces or clears the telemetry provider. Ignored after {@link disconnect}.
   * @param telemetry - Host telemetry provider, or `undefined` to record nothing for now.
   */
  connect(telemetry: OperationalTelemetryTarget | undefined): void;
  /**
   * Stops reporting permanently, so in-flight work never reports into a torn-down host.
   * Call it from the owning provider's teardown.
   */
  disconnect(): void;
  /**
   * Records one safe outcome as `fusion.<module>.<operation>` records. Never throws, and
   * records nothing while disconnected.
   * @param report - Allowlisted outcome; arguments, payloads and errors are never accepted.
   */
  report(report: OperationalTelemetryReport): void;
}

/**
 * Creates the operational telemetry handle a module uses to report safe outcomes.
 *
 * This is the common wiring pattern for framework modules: the provider owns the handle,
 * the module connects it after initialization, and teardown disconnects it. A measured report
 * becomes one `fusion.<module>.<operation>.duration` metric, plus one sanitized `.failure`
 * exception on failure; a notification becomes one `fusion.<module>.<operation>` event.
 * Telemetry stays optional: until connected, nothing is recorded. Delivery failures never
 * reach the business operation and produce one sanitized console warning per handle.
 *
 * @param module - Static kebab-case module label, such as `signalr`.
 * @returns A disconnected handle.
 * @throws {RangeError} When `module` is not a static kebab-case identifier.
 * @example
 * ```ts
 * class SignalRProvider extends BaseModuleProvider<Config> implements TelemetryConnectable {
 *   #telemetry = createOperationalTelemetry('signalr');
 *
 *   constructor(config: Config) {
 *     super({ version, config });
 *     this._addTeardown(() => this.#telemetry.disconnect());
 *   }
 *
 *   connectTelemetry(telemetry: ITelemetryProvider | undefined): void {
 *     this.#telemetry.connect(telemetry);
 *   }
 *
 *   async connect(): Promise<void> {
 *     const started = performance.now();
 *     await this.#start();
 *     this.#telemetry.report({ operation: 'connect', outcome: 'success', duration: performance.now() - started });
 *   }
 * }
 *
 * // Module descriptor: connect after initialization, so startup never waits for telemetry.
 * postInitialize: async ({ instance, modules }) => instance.connectTelemetry?.(modules.telemetry),
 * ```
 */
export function createOperationalTelemetry(module: string): OperationalTelemetry {
  // A dynamic label would leak into every record name, so reject it when the handle is created.
  if (!operationalIdentifier.safeParse(module).success) {
    throw new RangeError('Invalid operational telemetry module');
  }
  let telemetry: OperationalTelemetryTarget | undefined;
  let disposed = false;
  const reporter = createOperationalReporter(() => telemetry);
  return {
    module,
    get connected() {
      return telemetry !== undefined;
    },
    connect(next) {
      // Teardown is final; a late connection must not revive a disposed provider.
      if (!disposed) {
        telemetry = next;
      }
    },
    disconnect() {
      disposed = true;
      telemetry = undefined;
    },
    report(report) {
      // Adding the bound label restores the union member the report was narrowed from.
      reporter({ ...report, module } as OperationalReport);
    },
  };
}
