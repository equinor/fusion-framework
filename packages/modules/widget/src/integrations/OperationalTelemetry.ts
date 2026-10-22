import { Observable, type MonoTypeOperatorFunction } from 'rxjs';
import {
  TelemetryLevel,
  type ITelemetryProvider,
} from '@equinor/fusion-framework-module-telemetry';
import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';
import {
  createDiagnosticContext,
  createOperationalRecords,
} from '@equinor/fusion-framework-module-telemetry/utils';

/**
 * Allowlisted primitive summary fields attached to operational records, such as a stage, a
 * controlled reason code, a count or a validated static identity. Never payloads, arguments,
 * URLs, user data or raw error text.
 */
export type OperationalProperties = Readonly<Record<string, string | number | boolean>>;

/**
 * Ends one attempted operation. Only the first call records a terminal outcome, so racing
 * success, failure, cancellation and teardown paths cannot double-count an operation.
 */
export type EndOperation = (
  outcome: OperationalOutcome,
  properties?: OperationalProperties,
) => void;

/** Optional collaborators of one {@link OperationalTelemetry} scope. */
export interface OperationalTelemetryOptions {
  /**
   * Owner-held set the scope joins only while it has unsettled operations, so an owner can
   * close in-flight work at its own teardown without retaining idle or abandoned scopes.
   */
  registry?: Set<OperationalTelemetry>;
  /** Static identity resolved when an operation ends, e.g. an app key and loaded version. */
  identity?: () => OperationalProperties;
}

/** Releasable resource owned by a scope, such as a diagnostic observer subscription. */
type Teardown = VoidFunction | { unsubscribe(): void };

/** Bounds retained timers when an operation never settles, e.g. a hung backend request. */
const PENDING_CAPACITY = 256;

const noop: EndOperation = () => undefined;

/** Errors that represent deliberate cancellations, held weakly so errors are never retained. */
const cancellations = new WeakSet<object>();
/** Static reason codes attached to errors without changing them. */
const reasons = new WeakMap<object, string>();

const safeKey = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const safeVersion = /^[0-9A-Za-z][0-9A-Za-z.+-]{0,63}$/;

/**
 * Optional, failure-isolated operational telemetry for one module scope.
 *
 * Wraps the public `createOperationalRecords` and `createDiagnosticContext` helpers so that
 * every attempted operation emits exactly one terminal duration metric, plus one sanitized
 * exception on failure. Telemetry is resolved lazily, never awaited, and delivery failures
 * are reported once locally instead of reaching business code.
 *
 * @remarks
 * Internal to this package; each feature module keeps its own copy so telemetry stays an
 * optional integration rather than a new shared contract.
 */
export class OperationalTelemetry {
  /**
   * Marks an error that represents a deliberate cancellation, such as a canceled framework
   * event, without changing its message, type or how callers observe it.
   * @template T - The error type, returned unchanged.
   * @param error - The error that will be thrown to the caller unchanged.
   * @param reason - Optional static reason code, such as `listener`.
   * @returns The same error, for inline `throw OperationalTelemetry.markCancellation(...)`.
   */
  static markCancellation<T extends object>(error: T, reason?: string): T {
    cancellations.add(error);
    return reason ? OperationalTelemetry.markReason(error, reason) : error;
  }

  /**
   * Attaches a static reason code, such as `validation`, to an error without changing it.
   * @template T - The error type, returned unchanged.
   * @param error - The error that will be thrown to the caller unchanged.
   * @param reason - Static kebab-case reason code; never derived from error text.
   * @returns The same error.
   */
  static markReason<T extends object>(error: T, reason: string): T {
    reasons.set(error, reason);
    return error;
  }

  /**
   * Classifies an error as cancellation or failure, following wrapped `cause` chains so a
   * cancellation re-thrown inside a wrapping error is still recognized.
   * @param error - The error observed by the operation.
   * @returns The outcome and, when one was marked, its static reason code.
   */
  static classifyError(error: unknown): { outcome: OperationalOutcome; reason?: string } {
    let current: unknown = error;
    let reason: string | undefined;
    // A short, fixed depth cannot loop on self-referencing causes.
    for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
      reason ??= reasons.get(current);
      // A marked cancellation anywhere in the chain wins over the wrapping failure.
      if (cancellations.has(current)) {
        return { outcome: 'cancelled', reason };
      }
      current = (current as { cause?: unknown }).cause;
    }
    return { outcome: 'failure', reason };
  }

  /**
   * Returns static identity, such as an app key or build version, only when it cannot carry
   * URLs, paths, whitespace or other dynamic fragments.
   * @param value - Candidate key or version.
   * @param kind - `key` for identifiers, `version` for semantic-version-like strings.
   * @returns The value when safe; otherwise `undefined`, so the field is omitted.
   */
  static safeIdentity(value: unknown, kind: 'key' | 'version' = 'key'): string | undefined {
    return typeof value === 'string' && (kind === 'key' ? safeKey : safeVersion).test(value)
      ? value
      : undefined;
  }

  readonly #module: string;
  #provider?: () => ITelemetryProvider | undefined;
  readonly #pending = new Set<EndOperation>();
  readonly #registry?: Set<OperationalTelemetry>;
  readonly #identity?: () => OperationalProperties;
  #teardowns: Teardown[] = [];
  #closed = false;
  #warned = false;

  /**
   * @param module - Static kebab-case module label, such as `app` or `bookmark`.
   * @param provider - Lazy telemetry lookup; may be connected later.
   * @param options - Optional owner registry and end-time identity.
   */
  constructor(
    module: string,
    provider?: () => ITelemetryProvider | undefined,
    options?: OperationalTelemetryOptions,
  ) {
    this.#module = module;
    this.#provider = provider;
    this.#registry = options?.registry;
    this.#identity = options?.identity;
  }

  /**
   * Number of started operations without a terminal outcome.
   * @returns The pending operation count.
   */
  get pending(): number {
    return this.#pending.size;
  }

  /**
   * Whether outcomes can currently be recorded; lets callers skip optional observation work.
   * @returns `true` while the scope is open and telemetry currently resolves.
   */
  get active(): boolean {
    return !this.#closed && this.#resolve() !== undefined;
  }

  /**
   * Connects host telemetry after providers exist, so modules never wait on telemetry.
   * @param provider - Lazy telemetry lookup; `undefined` keeps telemetry disabled.
   */
  connect(provider: (() => ITelemetryProvider | undefined) | undefined): void {
    // A closed scope stays closed, so a disposed owner cannot be revived.
    if (!this.#closed) {
      this.#provider = provider;
    }
  }

  /**
   * Starts timing one attempted operation.
   * @param operation - Static kebab-case operation label.
   * @param properties - Allowlisted summary fields shared by the terminal records.
   * @returns A single-use function recording the terminal outcome; a no-op when not timed.
   */
  start(operation: string, properties?: OperationalProperties): EndOperation {
    return this.reserve(operation, properties) ?? noop;
  }

  /**
   * Reserves a timer for one attempted operation, so callers can skip optional observation
   * work when no timer was reserved.
   * @param operation - Static kebab-case operation label.
   * @param properties - Allowlisted summary fields shared by the terminal records.
   * @returns A single-use end function, or `undefined` when the scope is closed, telemetry is
   *   absent, or the pending-operation capacity is exhausted.
   */
  reserve(operation: string, properties?: OperationalProperties): EndOperation | undefined {
    // Closed scopes and absent telemetry keep no timers, so they cannot retain state.
    if (this.#closed || this.#resolve() === undefined) {
      return undefined;
    }
    // Unsettled operations are bounded; beyond the cap, attempts are not timed.
    if (this.#pending.size >= PENDING_CAPACITY) {
      this.#warn('pending-operation capacity exceeded');
      return undefined;
    }
    const started = performance.now();
    const end: EndOperation = (outcome, extra) => {
      // Only the first terminal path records; later racing paths are ignored.
      if (!this.#pending.delete(end)) {
        return;
      }
      // An idle scope leaves its owner's registry, so abandoned owners are never retained.
      if (this.#pending.size === 0) {
        this.#registry?.delete(this);
      }
      // Identity resolved now includes values learned while the operation ran; terminal
      // fields, such as a failure reason, extend the fields given at start.
      this.#emit(operation, outcome, performance.now() - started, {
        ...properties,
        ...this.#identity?.(),
        ...extra,
      });
    };
    this.#pending.add(end);
    this.#registry?.add(this);
    return end;
  }

  /**
   * Owns a diagnostic resource, such as an observer subscription, released when the scope
   * closes. Resources added to a closed scope are released immediately.
   * @param teardown - Function or subscription to release.
   */
  own(teardown: Teardown): void {
    // A closed scope cannot hold new resources.
    if (this.#closed) {
      OperationalTelemetry.#release(teardown);
      return;
    }
    this.#teardowns.push(teardown);
  }

  /**
   * Records an outcome without a measured boundary, such as a status change, as an event
   * rather than a fabricated zero-duration metric.
   * @param operation - Static kebab-case operation label.
   * @param outcome - Outcome described by the notification.
   * @param properties - Allowlisted summary fields.
   */
  notify(operation: string, outcome: OperationalOutcome, properties?: OperationalProperties): void {
    // Nothing is reported after the owning scope ends.
    if (this.#closed) {
      return;
    }
    this.#deliver((telemetry, source) => {
      telemetry.trackEvent({
        name: `fusion.${this.#module}.${operation}`,
        level: outcome === 'failure' ? TelemetryLevel.Warning : TelemetryLevel.Information,
        scope: source.source ? [source.source, 'operational'] : ['operational'],
        properties: properties ? { ...properties } : undefined,
        diagnostic: createDiagnosticContext({
          source,
          module: this.#module,
          operation,
          outcome,
        }),
      });
    });
  }

  /**
   * Measures a cold observable from subscription to its terminal outcome. Errors are recorded
   * then re-thrown unchanged. Unsubscribing before any value counts as cancellation; after a
   * value, the caller already received its result, so it counts as success.
   * @template T - The observable value type, passed through unchanged.
   * @param operation - Static kebab-case operation label.
   * @param properties - Allowlisted summary fields.
   * @returns An operator that leaves values, errors and completion unchanged.
   */
  measure<T>(operation: string, properties?: OperationalProperties): MonoTypeOperatorFunction<T> {
    return (source) =>
      new Observable<T>((subscriber) => {
        const end = this.start(operation, properties);
        let emitted = false;
        const subscription = source.subscribe({
          next: (value) => {
            emitted = true;
            subscriber.next(value);
          },
          error: (error) => {
            const { outcome, reason } = OperationalTelemetry.classifyError(error);
            end(outcome, reason ? { reason } : undefined);
            subscriber.error(error);
          },
          complete: () => {
            end('success');
            subscriber.complete();
          },
        });
        return () => {
          subscription.unsubscribe();
          end(emitted ? 'success' : 'cancelled');
        };
      });
  }

  /**
   * Records every pending operation as cancelled, e.g. when its owner unloads.
   * @param properties - Allowlisted fields, such as the cancellation reason code.
   */
  cancelPending(properties?: OperationalProperties): void {
    // Iterate a snapshot, because each end removes itself from the pending set.
    for (const end of [...this.#pending]) {
      end('cancelled', properties);
    }
  }

  /**
   * Ends the scope: pending operations are recorded as cancelled, then nothing more is emitted.
   * @param properties - Allowlisted fields for the cancelled records.
   */
  close(properties?: OperationalProperties): void {
    // Repeated disposal is a no-op.
    if (this.#closed) {
      return;
    }
    this.cancelPending(properties);
    this.#closed = true;
    this.#provider = undefined;
    this.#registry?.delete(this);
    const teardowns = this.#teardowns;
    this.#teardowns = [];
    // Owned diagnostic observers stop once nothing more can be reported.
    for (const teardown of teardowns) {
      OperationalTelemetry.#release(teardown);
    }
  }

  /**
   * Releases one owned resource; a failing teardown must not prevent the others.
   * @param teardown - Function or subscription to release.
   */
  static #release(teardown: Teardown): void {
    try {
      // Subscriptions and plain teardown functions are both supported.
      if (typeof teardown === 'function') {
        teardown();
      } else {
        teardown.unsubscribe();
      }
    } catch {
      // Diagnostic teardown failures never reach the owner's disposal.
    }
  }

  /**
   * Resolves telemetry without letting a failing lookup reach business code.
   * @returns The telemetry provider, or `undefined` when absent or unavailable.
   */
  #resolve(): ITelemetryProvider | undefined {
    try {
      return this.#provider?.();
    } catch {
      return undefined;
    }
  }

  /**
   * Delivers one terminal duration metric and, on failure, one sanitized exception.
   * @param operation - Static kebab-case operation label.
   * @param outcome - Terminal outcome.
   * @param duration - Elapsed milliseconds.
   * @param properties - Allowlisted summary fields.
   */
  #emit(
    operation: string,
    outcome: OperationalOutcome,
    duration: number,
    properties: OperationalProperties,
  ): void {
    const fields = Object.keys(properties).length > 0 ? { ...properties } : undefined;
    this.#deliver((telemetry, source) => {
      // One duration metric, plus one sanitized exception for a failure.
      for (const record of createOperationalRecords({
        source,
        module: this.#module,
        operation,
        outcome,
        // Clock adjustments must not turn an elapsed time into an invalid negative value.
        duration: Math.max(0, duration),
      })) {
        // Every record of one outcome shares the same allowlisted summary fields.
        telemetry.track(fields ? { ...record, properties: fields } : record);
      }
    });
  }

  /**
   * Resolves telemetry lazily and isolates delivery failures from the business operation.
   * @param send - Delivery callback, invoked only when telemetry with host identity exists.
   */
  #deliver(
    send: (
      telemetry: ITelemetryProvider,
      source: NonNullable<ITelemetryProvider['source']>,
    ) => void,
  ): void {
    try {
      const telemetry = this.#provider?.();
      // Optional telemetry must never become a dependency of the business operation.
      if (!telemetry) {
        return;
      }
      // Built-in records require host identity rather than an invented origin.
      if (!telemetry.source) {
        this.#warn('requires host source identity');
        return;
      }
      send(telemetry, telemetry.source);
    } catch {
      // Diagnostic failures are reported locally once, never re-exported or re-thrown.
      this.#warn('delivery failed');
    }
  }

  /**
   * Reports a diagnostic delivery problem locally, once per scope, to avoid log amplification.
   * @param reason - Static description of the problem.
   */
  #warn(reason: string): void {
    // Repeated failures, such as an unavailable collector, are reported once.
    if (!this.#warned) {
      this.#warned = true;
      console.warn(`Operational telemetry for ${this.#module}: ${reason}`);
    }
  }
}
