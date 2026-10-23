import { operationalIdentifier } from '../schemas/operational-identifier.js';
import type { MonoTypeOperatorFunction } from 'rxjs';
import type { OperationalOutcome } from '../schemas/index.js';
import type { OperationalProperties } from './operational-properties.js';
import { OperationalTelemetryHandle } from '../lib/OperationalTelemetryHandle.js';
import type { classifyOperationalError } from './classify-operational-error.js';
import type { markOperationalCancellation } from './mark-operational-cancellation.js';
import type { markOperationalReason } from './mark-operational-reason.js';
import type { safeOperationalIdentity } from './safe-operational-identity.js';
import type {
  OperationalReport,
  OperationalTelemetryTarget,
} from './create-operational-reporter.js';

/** Removes a key from each member of a union, keeping the measured/notification split. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * One outcome reported through an {@link OperationalTelemetry} handle. The module label is
 * bound by the handle, so a report names only the operation, outcome and either a measured
 * `duration` or `notification: true` with an optional `level`.
 */
export type OperationalTelemetryReport = DistributiveOmit<OperationalReport, 'module'>;

/** Single-use terminal callback; racing outcomes cannot double-count an attempt. */
export type EndOperation = (
  outcome: OperationalOutcome,
  properties?: OperationalProperties,
) => void;

/** End-time static identity of an owned telemetry scope. */
export interface OperationalTelemetryOptions {
  /** Resolves identity at completion, including versions learned during the operation. */
  identity?: () => OperationalProperties;
}

/**
 * Connectable handle a module owns for its built-in operational telemetry.
 *
 * Create one per provider, connect it once a telemetry provider is available, report outcomes
 * through it, and disconnect it from the provider's teardown. With a built-in telemetry
 * provider, `telemetry.scope(module)` creates an already connected handle.
 */
export interface OperationalTelemetry {
  /** Static kebab-case module label used in every record name. */
  readonly module: string;
  /** Whether reports are currently delivered to a telemetry provider. */
  readonly connected: boolean;
  /** Whether the scope is open and a provider currently resolves. */
  readonly active: boolean;
  /** Number of retained operations, bounded to 256 per scope. */
  readonly pending: number;
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
  /**
   * Creates an independently disposable owned scope.
   * @param options - Optional end-time identity.
   * @returns A child sharing the parent's live target.
   */
  createScope(options?: OperationalTelemetryOptions): OperationalTelemetry;
  /**
   * Starts an attempt without making telemetry a dependency of business work.
   * @param operation - Static kebab-case operation label.
   * @param properties - Allowlisted primitive summaries.
   * @returns A single-use end callback, or a no-op while absent, closed or saturated.
   */
  start(operation: string, properties?: OperationalProperties): EndOperation;
  /**
   * Reserves an attempt so observers can avoid allocating work when it cannot be recorded.
   * @param operation - Static kebab-case operation label.
   * @param properties - Allowlisted primitive summaries.
   * @returns An end callback, or undefined while absent, closed or at the 256-operation cap.
   */
  reserve(operation: string, properties?: OperationalProperties): EndOperation | undefined;
  /**
   * Measures each subscription without changing observable values, errors or cancellation.
   * @template T - Observable value type, passed through unchanged.
   * @param operation - Static kebab-case operation label.
   * @param properties - Allowlisted primitive summaries.
   * @returns An observation-only operator, recording success on completion or after a value.
   */
  measure<T>(operation: string, properties?: OperationalProperties): MonoTypeOperatorFunction<T>;
  /**
   * Reports an unmeasured condition; failures use Warning, other outcomes Information.
   * @param operation - Static kebab-case operation label.
   * @param outcome - Condition outcome, without a fabricated duration.
   * @param properties - Allowlisted primitive summaries.
   */
  notify(operation: string, outcome: OperationalOutcome, properties?: OperationalProperties): void;
  /**
   * Releases an observer or teardown when the scope closes.
   * @param teardown - Owned diagnostic resource; released immediately if already closed.
   */
  own(teardown: VoidFunction | { unsubscribe(): void }): void;
  /**
   * Ends all retained attempts as cancelled exactly once, keeping the scope open.
   * @param properties - Allowlisted terminal fields, such as a cancellation reason.
   */
  cancelPending(properties?: OperationalProperties): void;
  /**
   * Cancels in-flight owned work then permanently stops reporting.
   * @param properties - Allowlisted terminal fields applied to pending owned operations.
   */
  close(properties?: OperationalProperties): void;
  /** Shared cancellation classification, including wrapped causes. */
  classifyError: typeof classifyOperationalError;
  /** Marks deliberate cancellation without changing the original error. */
  markCancellation: typeof markOperationalCancellation;
  /** Attaches a controlled reason without changing the original error. */
  markReason: typeof markOperationalReason;
  /** Validates static identity before it enters record properties. */
  safeIdentity: typeof safeOperationalIdentity;
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
 * @param options - Optional static identity resolved when measured operations end.
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
export function createOperationalTelemetry(
  module: string,
  options?: OperationalTelemetryOptions,
): OperationalTelemetry {
  // A dynamic label would leak into every record name, so reject it when the handle is created.
  if (!operationalIdentifier.safeParse(module).success) {
    throw new RangeError('Invalid operational telemetry module');
  }
  return new OperationalTelemetryHandle(module, options);
}
