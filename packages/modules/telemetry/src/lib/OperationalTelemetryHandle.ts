import { defer, finalize, tap, type MonoTypeOperatorFunction } from 'rxjs';
import { TelemetryLevel } from '../static.js';
import type { OperationalOutcome } from '../schemas/index.js';
import type {
  EndOperation,
  OperationalTelemetry,
  OperationalTelemetryOptions,
  OperationalTelemetryReport,
} from '../utils/create-operational-telemetry.js';
import {
  createOperationalReporter,
  type OperationalReport,
  type OperationalTelemetryTarget,
} from '../utils/create-operational-reporter.js';
import type { OperationalProperties } from '../utils/operational-properties.js';
import { classifyOperationalError } from '../utils/classify-operational-error.js';
import { markOperationalCancellation } from '../utils/mark-operational-cancellation.js';
import { markOperationalReason } from '../utils/mark-operational-reason.js';
import { safeOperationalIdentity } from '../utils/safe-operational-identity.js';

const noop: EndOperation = () => undefined;
type Teardown = VoidFunction | { unsubscribe(): void };

/** Shared bounded operation lifecycle behind the public telemetry factory. */
export class OperationalTelemetryHandle implements OperationalTelemetry {
  /** {@inheritDoc OperationalTelemetry.classifyError} */
  readonly classifyError = classifyOperationalError;
  /** {@inheritDoc OperationalTelemetry.markCancellation} */
  readonly markCancellation = markOperationalCancellation;
  /** {@inheritDoc OperationalTelemetry.markReason} */
  readonly markReason = markOperationalReason;
  /** {@inheritDoc OperationalTelemetry.safeIdentity} */
  readonly safeIdentity = safeOperationalIdentity;
  readonly #pending = new Set<EndOperation>();
  readonly #busyChildren = new Set<OperationalTelemetryHandle>();
  #teardowns: Teardown[] = [];
  #target?: OperationalTelemetryTarget;
  #closed = false;
  #warned = false;
  readonly #reporter;

  /**
   * Creates one scope; children resolve their target through the parent.
   * @param module - Validated static module label.
   * @param options - End-time identity.
   * @param parent - Owning scope, when this is a child.
   */
  constructor(
    readonly module: string,
    private readonly options?: OperationalTelemetryOptions,
    private readonly parent?: OperationalTelemetryHandle,
  ) {
    this.#reporter = createOperationalReporter(() => this.#resolve());
  }

  /** {@inheritDoc OperationalTelemetry.connected} */
  get connected(): boolean {
    return this.active;
  }

  /** {@inheritDoc OperationalTelemetry.active} */
  get active(): boolean {
    return this.#resolve() !== undefined;
  }

  /** {@inheritDoc OperationalTelemetry.pending} */
  get pending(): number {
    return this.#pending.size;
  }

  /** {@inheritDoc OperationalTelemetry.connect} */
  readonly connect = (target: OperationalTelemetryTarget | undefined): void => {
    // Scope disposal is final, even if a host tries to reconnect it.
    if (!this.#closed) {
      this.#target = target;
    }
  };

  /** {@inheritDoc OperationalTelemetry.disconnect} */
  readonly disconnect = (): void => {
    this.close();
  };

  /** {@inheritDoc OperationalTelemetry.report} */
  readonly report = (report: OperationalTelemetryReport): void => {
    this.#reporter({ ...report, module: this.module } as OperationalReport);
  };

  /** {@inheritDoc OperationalTelemetry.createScope} */
  createScope(options?: OperationalTelemetryOptions): OperationalTelemetry {
    const child = new OperationalTelemetryHandle(this.module, options, this);
    // Children cannot revive closed ownership.
    if (this.#closed) {
      child.close();
    }
    return child;
  }

  /** {@inheritDoc OperationalTelemetry.start} */
  start(operation: string, properties?: OperationalProperties): EndOperation {
    return this.reserve(operation, properties) ?? noop;
  }

  /** {@inheritDoc OperationalTelemetry.reserve} */
  reserve(operation: string, properties?: OperationalProperties): EndOperation | undefined {
    // Absent or disposed telemetry retains no timers or observation work.
    if (!this.active) {
      return undefined;
    }
    // Hung operations must not grow an unbounded set of retained callbacks.
    if (this.#pending.size >= 256) {
      this.#warn('pending-operation capacity exceeded');
      return undefined;
    }
    const started = performance.now();
    const end: EndOperation = (outcome, extra) => {
      // Only the first terminal path records, even when teardown races with completion.
      if (!this.#pending.delete(end)) {
        return;
      }
      this.#releaseParentIfIdle();
      try {
        // Terminal fields override late-resolved identity, which extends the initial summaries.
        const fields = { ...properties, ...this.options?.identity?.(), ...extra };
        this.report({
          operation,
          outcome,
          duration: Math.max(0, performance.now() - started),
          ...(Object.keys(fields).length ? { properties: fields } : {}),
        });
      } catch {
        this.#warn('identity resolution failed');
      }
    };
    this.#pending.add(end);
    this.#retainParent();
    return end;
  }

  /** {@inheritDoc OperationalTelemetry.measure} */
  measure<T>(operation: string, properties?: OperationalProperties): MonoTypeOperatorFunction<T> {
    return (source) =>
      defer(() => {
        const end = this.reserve(operation, properties);
        // With no retained timer, do not add observers to the business stream.
        if (!end) {
          return source;
        }
        let emitted = false;
        // Linked operators preserve synchronous downstream unsubscription and original errors.
        return source.pipe(
          tap({
            next: () => {
              emitted = true;
            },
            error: (error) => {
              const { outcome, reason } = classifyOperationalError(error);
              end(outcome, reason ? { reason } : undefined);
            },
            complete: () => end('success'),
          }),
          finalize(() => end(emitted ? 'success' : 'cancelled')),
        );
      });
  }

  /** {@inheritDoc OperationalTelemetry.notify} */
  notify(operation: string, outcome: OperationalOutcome, properties?: OperationalProperties): void {
    this.report({
      operation,
      outcome,
      properties,
      notification: true,
      level: outcome === 'failure' ? TelemetryLevel.Warning : TelemetryLevel.Information,
    });
  }

  /** {@inheritDoc OperationalTelemetry.own} */
  own(teardown: Teardown): void {
    // Idle children can outlive an ancestor without being retained by it.
    if (this.#isClosed()) {
      this.#release(teardown);
      return;
    }
    this.#teardowns.push(teardown);
    this.#retainParent();
  }

  /** {@inheritDoc OperationalTelemetry.cancelPending} */
  cancelPending(properties?: OperationalProperties): void {
    // Each end removes itself, so iterate a stable snapshot.
    for (const end of [...this.#pending]) {
      end('cancelled', properties);
    }
  }

  /** {@inheritDoc OperationalTelemetry.close} */
  close(properties?: OperationalProperties): void {
    // Repeated disposal must neither emit nor release resources twice.
    if (this.#closed) {
      return;
    }
    // Children need the live parent target to record their cancellations.
    for (const child of [...this.#busyChildren]) {
      child.close(properties);
    }
    this.cancelPending(properties);
    this.#closed = true;
    this.#target = undefined;
    // Idle descendants resolve closure through their ancestor rather than being retained.
    if (this.parent) {
      this.parent.#busyChildren.delete(this);
      this.parent.#releaseParentIfIdle();
    }
    const teardowns = this.#teardowns;
    this.#teardowns = [];
    // One failing observer must not prevent other observers from being released.
    for (const teardown of teardowns) {
      this.#release(teardown);
    }
  }

  /**
   * Resolves live ownership without retaining idle children.
   * @returns The live ancestor's telemetry target, or undefined after closure.
   */
  #resolve(): OperationalTelemetryTarget | undefined {
    // Cleared targets alone cannot prevent a child from reconnecting after final disposal.
    if (this.#closed) {
      return undefined;
    }
    return this.parent ? this.parent.#resolve() : this.#target;
  }

  /**
   * Includes closed idle ancestors, which are deliberately not retained in child sets.
   * @returns Whether this scope or any ancestor has closed.
   */
  #isClosed(): boolean {
    return this.#closed || (this.parent ? this.parent.#isClosed() : false);
  }

  /** Keeps every ancestor aware of owned work, including nested scopes. */
  #retainParent(): void {
    // Propagate busy ownership through all ancestors, not only the immediate parent.
    if (this.parent) {
      this.parent.#busyChildren.add(this);
      this.parent.#retainParent();
    }
  }

  /** Drops settled children so abandoned idle owners are not retained. */
  #releaseParentIfIdle(): void {
    // Retain only work or resources, never abandoned idle child handles.
    if (!this.#pending.size && !this.#busyChildren.size && !this.#teardowns.length) {
      // Settling the last descendant can also make its ancestors idle.
      if (this.parent) {
        this.parent.#busyChildren.delete(this);
        this.parent.#releaseParentIfIdle();
      }
    }
  }

  /**
   * Isolates resource failures so all owned observers are released.
   * @param teardown - Owned diagnostic resource.
   */
  #release(teardown: Teardown): void {
    try {
      // Accept RxJS subscriptions without making plain teardowns allocate subscriptions.
      if (typeof teardown === 'function') {
        teardown();
      } else {
        teardown.unsubscribe();
      }
    } catch {
      this.#warn('diagnostic teardown failed');
    }
  }

  /**
   * Bounds sanitized local diagnostics independently of exported operational records.
   * @param reason - Static local diagnostic.
   */
  #warn(reason: string): void {
    // Local diagnostic failures cannot amplify into repeated warnings or exported records.
    if (!this.#warned) {
      this.#warned = true;
      console.warn(`Operational telemetry for ${this.module}: ${reason}`);
    }
  }
}
