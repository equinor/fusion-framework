import {
  type Observable,
  type ObservableInput,
  Subject,
  Subscription,
  catchError,
  defer,
  filter,
  finalize,
  firstValueFrom,
  from,
  map,
  of,
  take,
  takeUntil,
  timeout,
} from 'rxjs';
import { FlowSubject } from '@equinor/fusion-observable';
import type { Modules, ModulesInstanceType } from '@equinor/fusion-framework-module';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import type { TelemetryConfig } from './TelemetryConfigurator.interface.js';
import type { ITelemetryAdapter } from './TelemetryAdapter.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { TelemetryErrorEvent, TelemetryEvent } from './TelemetryEvent.js';
import { TelemetryItemNames } from './static.js';
import type { TelemetryItem } from './types.js';
import { mergeTelemetryItem } from './utils/merge-telemetry-item.js';
import { relayRecord } from './utils/relay-record.js';
import { operationalScope } from './utils/operational-scope.js';
import { applyMetadata } from './utils/resolve-metadata.js';
import {
  type TelemetryInitializeArgs,
  type TelemetryProviderAction,
  telemetryProviderActions as actions,
} from './TelemetryProviderState.actions.js';
import {
  type TelemetryProviderSnapshot,
  type TelemetryProviderStatus,
  createTelemetryProviderReducer,
} from './TelemetryProviderState.reducer.js';
import { createTelemetryProviderFlows } from './TelemetryProviderState.flows.js';

/** Pending metadata enrichment allowed per provider before built-in records skip enrichment. */
const METADATA_CAPACITY = 256;
/** Deadline for built-in enrichment; on expiry the original safe record is emitted. */
const BUILT_IN_METADATA_TIMEOUT_MS = 1_000;
/** Pending asynchronous processing allowed per adapter before records are dropped for it. */
const ADAPTER_PROCESSING_CAPACITY = 256;

/** A record on the provider stream, carrying fallback ownership with the record itself. */
interface TelemetryRecord {
  item: TelemetryItem;
  /** An explicit child exporter already handled the record, so fallback adapters skip it. */
  handledByChild: boolean;
}

/** Telemetry configuration with defaults and exporter ownership resolved once. */
type ResolvedTelemetryConfig = Readonly<
  Omit<TelemetryConfig, 'adapters' | 'defaultScope' | 'ownsExport'> & {
    adapters: Record<string, ITelemetryAdapter>;
    defaultScope: string[];
    ownsExport: boolean;
  }
>;

/** What the telemetry engine needs from the provider that exposes it. */
export interface TelemetryProviderStateContext {
  /** Resolved telemetry configuration. */
  config: TelemetryConfig;
  /** Event bus receiving record events and out-of-band health events. */
  event?: IEventModuleProvider;
  /** The public provider: source of dispatched events and validator of startup records. */
  owner: ITelemetryProvider;
}

/**
 * The telemetry engine behind a `TelemetryProvider`.
 *
 * Owns the record pipeline (scope, built-in envelope protection, bounded metadata enrichment,
 * adapter delivery, parent relay and event dispatch) and a reactive state of lifecycle,
 * in-flight work and health. `initialize` and `dispose` are async actions whose flows perform
 * the work; failures are recorded in state and reported once by a flow.
 *
 * Records stay on a synchronous stream rather than becoming actions, so adapter delivery
 * happens within `track`. Operation outcomes are delivered as actions on the `asyncScheduler`,
 * so with fake timers, advance timers to settle `initialize` or `dispose`.
 *
 * @example
 * ```ts
 * const state = new TelemetryProviderState({ config, owner: provider });
 * await state.initialize({ parent });
 * state.track(record);
 * await state.dispose();
 * ```
 */
export class TelemetryProviderState {
  #subject: FlowSubject<TelemetryProviderSnapshot, TelemetryProviderAction>;
  #records = new Subject<TelemetryRecord>();
  /** Delivery subscriptions, released together when delivery closes. */
  #connections = new Subscription();
  #config: ResolvedTelemetryConfig;
  #context: Omit<TelemetryProviderStateContext, 'config'>;
  #modules?: ModulesInstanceType<Modules>;

  /**
   * Creates the engine and registers the flows driving its operations.
   * @param context - Configuration, event bus and the public provider.
   */
  constructor({ config, ...context }: TelemetryProviderStateContext) {
    const adapters = config?.adapters ?? {};
    // Configuration, not delivery success, determines inherited fallback suppression.
    const ownsExport =
      config?.ownsExport ?? Object.values(adapters).some((adapter) => !adapter.fallback);
    this.#config = Object.freeze({
      ...config,
      adapters,
      defaultScope: config?.defaultScope ?? [],
      ownsExport,
    });
    this.#context = context;
    this.#subject = new FlowSubject(createTelemetryProviderReducer());
    const flows = createTelemetryProviderFlows({
      connect: (args) => this.#connect(args),
      close: () => this.#close(),
      shutdown: () => this.#shutdown(),
      report: (error, status) => this.#report(error, status),
    });
    // Every operation and health reaction is a flow over this state's actions.
    for (const flow of flows) {
      this.#subject.addFlow(flow);
    }
  }

  /**
   * Current snapshot of lifecycle, in-flight work and health.
   * @returns The latest reduced snapshot.
   */
  get value(): TelemetryProviderSnapshot {
    return this.#subject.value;
  }

  /**
   * Every record tracked by the provider, after scope and enrichment.
   * @returns The record stream without its internal ownership envelope.
   */
  get items(): Observable<TelemetryItem> {
    // Expose records without their internal ownership envelope.
    return this.#records.pipe(map(({ item }) => item));
  }

  /**
   * Exporters configured for this provider, keyed by identifier.
   * @returns The resolved adapters.
   */
  get adapters(): Readonly<Record<string, ITelemetryAdapter>> {
    return this.#config.adapters;
  }

  /**
   * Sets the resolved framework module instances used to resolve metadata.
   * @param value - The resolved framework module instances.
   */
  set modules(value: ModulesInstanceType<Modules>) {
    this.#modules = value;
  }

  /**
   * Selects a derived value, emitting the current value and then only changes.
   * @param selector - Projection of the snapshot.
   * @returns The selected value stream.
   * @template T - Selected value type.
   */
  select<T>(selector: (snapshot: TelemetryProviderSnapshot) => T): Observable<T> {
    return this.#subject.select(selector);
  }

  /**
   * Emits once when the snapshot satisfies a condition, immediately when it already does.
   * @param predicate - Condition over the snapshot.
   * @returns A single-emission stream suited to cancellation with `takeUntil`.
   */
  when(predicate: (snapshot: TelemetryProviderSnapshot) => boolean): Observable<true> {
    // Only the first matching transition matters for cancellation.
    return this.select(predicate).pipe(
      filter((matched): matched is true => matched),
      take(1),
    );
  }

  /**
   * Connects exporters, the parent relay and startup streams once; repeated calls join.
   * @param args - Optional parent provider and startup records.
   * @returns Resolves when the provider is connected.
   * @throws {Error} When the provider has already been disposed.
   */
  initialize(args?: TelemetryInitializeArgs): Promise<void> {
    const { status, initialization } = this.value;
    // A disposed provider must not reconnect exporters or event subscriptions.
    if (status === 'disposed') {
      return Promise.reject(new Error('Cannot initialize disposed telemetry'));
    }
    // Repeated and reentrant initialization joins the same operation.
    if (initialization) {
      return initialization;
    }
    const operation = this.#settled(
      actions.initialize.success.match,
      actions.initialize.failure.match,
    );
    this.#subject.next(actions.initialize(args, operation));
    return operation;
  }

  /**
   * Drains owned work, closes delivery and shuts down exporters once; repeated calls join.
   * @returns Resolves after every exporter has shut down.
   * @throws {AggregateError} When any exporter fails to shut down; all are still attempted.
   */
  dispose(): Promise<void> {
    const { disposal } = this.value;
    // Direct disposal and module disposal must join the same pending shutdown.
    if (disposal) {
      return disposal;
    }
    const operation = this.#settled(actions.dispose.success.match, actions.dispose.failure.match);
    // Dispatch before any exporter callback runs, so reentrant disposal joins this operation.
    this.#subject.next(actions.dispose(operation));
    return operation;
  }

  /**
   * Records a pipeline health failure; the first occurrence of each is reported.
   * @param error - Controlled failure description; never a raw business error.
   */
  fail(error: Error): void {
    this.#subject.next(actions.failed(error));
  }

  /**
   * Tracks a validated record: applies scope, protects built-in envelopes, enriches metadata
   * within bounds and emits it to adapters, the parent and the event bus.
   *
   * @param item - Validated telemetry record.
   * @param handledByChild - Whether an explicit child exporter already handled the record.
   */
  track(item: TelemetryItem, handledByChild = false): void {
    const { status, enrichment } = this.value;
    // Stop accepting records before flushing, while allowing already-owned enrichment to settle.
    if (status === 'disposing' || status === 'disposed') {
      return;
    }
    const mergedItem = mergeTelemetryItem(item, {
      scope: item.diagnostic ? undefined : this.#config.defaultScope,
    });
    // Snapshot before invoking consumer metadata; neither enrichment nor adapters may rewrite origin.
    const diagnostic = mergedItem.diagnostic
      ? Object.freeze({ ...mergedItem.diagnostic })
      : undefined;
    const operational = diagnostic
      ? {
          ...mergedItem,
          diagnostic,
          metadata: undefined,
          scope: [...mergedItem.scope],
          properties: mergedItem.properties ? { ...mergedItem.properties } : undefined,
        }
      : undefined;
    // Immutable built-in envelopes keep one adapter from contaminating sibling or parent delivery.
    if (operational) {
      Object.freeze(operational.scope);
      Object.freeze(operational.properties);
      Object.freeze(operational);
    }
    const emit = (nextItem: TelemetryItem): void => {
      // Late custom metadata emissions cannot revive a completed provider.
      if (this.value.status !== 'disposed') {
        // Dynamic metadata is consumer-controlled; built-in records export only their safe envelope.
        this.#records.next({ item: operational ?? nextItem, handledByChild });
      }
    };

    const { metadata } = this.#config;
    // Skip metadata application for TelemetryMetadataError items to prevent infinite recursion
    if (!metadata || mergedItem.name === TelemetryItemNames.MetadataError) {
      // Providers without metadata still need the same fallback precedence.
      emit(mergedItem);
      return;
    }
    // Bounded built-in enrichment degrades to the safe original instead of dropping the outcome.
    if (diagnostic && enrichment.pending >= METADATA_CAPACITY) {
      this.fail(new Error('Built-in telemetry metadata capacity exceeded'));
      emit(mergedItem);
      return;
    }
    const builtIn = diagnostic !== undefined;
    this.#subject.next(actions.enrichmentStarted(builtIn));
    const metadata$ = defer(() =>
      applyMetadata(metadata, { modules: this.#modules, item: mergedItem }),
    );
    // Enrichment is a bounded, cancellable stage whose in-flight work is provider state.
    metadata$
      .pipe(
        // Custom records retain their legacy timing; built-in outcomes have a finite enrichment deadline.
        builtIn ? timeout({ first: BUILT_IN_METADATA_TIMEOUT_MS }) : (source$) => source$,
        // Failure recovery preserves the terminal outcome even when metadata throws or times out.
        catchError(() => {
          this.fail(new Error('Telemetry metadata resolution failed'));
          return of(mergedItem);
        }),
        // Closing cancels custom enrichment; built-in enrichment has already drained by then.
        takeUntil(this.when((snapshot) => snapshot.status === 'disposed')),
        // Leaving flight is state, so disposal can wait on the drained condition.
        finalize(() => this.#subject.next(actions.enrichmentSettled(builtIn))),
      )
      .subscribe({
        next: (nextItem) => {
          // Raw enrichment errors are health failures, not exportable built-in exceptions.
          if (diagnostic && nextItem.name === TelemetryItemNames.MetadataError) {
            this.fail(new Error('Telemetry metadata resolution failed'));
            return;
          }
          emit(nextItem);
        },
        error: () => {
          this.fail(new Error('Telemetry metadata resolution failed'));
          emit(mergedItem);
        },
      });
  }

  /**
   * Settles an operation from its outcome action.
   * @param succeeded - Matches the operation's success action.
   * @param failed - Matches the operation's failure action.
   * @returns Resolves on success; rejects with the failure payload.
   * @throws The failure action's payload, normally the original operation error.
   */
  #settled(
    succeeded: (action: TelemetryProviderAction) => boolean,
    failed: (action: TelemetryProviderAction) => boolean,
  ): Promise<void> {
    // The first outcome of this operation settles every joined caller.
    const outcome$ = this.#subject.action$.pipe(
      filter((action) => succeeded(action) || failed(action)),
    );
    return firstValueFrom(outcome$).then((action) => {
      // A failure outcome carries the original error as its payload.
      if (failed(action)) {
        throw 'payload' in action ? action.payload : action;
      }
    });
  }

  /**
   * Initializes exporters, then connects delivery, the parent relay and startup streams.
   * @param args - Optional parent provider and startup records.
   */
  async #connect(args?: TelemetryInitializeArgs): Promise<void> {
    const { parent, initialItems } = args ?? {};
    const exporters = Object.entries(this.#config.adapters);
    // Exporters initialize concurrently; one failing exporter must not block the others.
    const results = await Promise.allSettled(
      // Start every exporter's initialization; async wrapping turns synchronous throws into rejections.
      exporters.map(async ([, adapter]) => adapter.initialize()),
    );
    // Report each exporter that failed to initialize, without its raw error.
    for (const [index, result] of results.entries()) {
      // Fulfilled exporters need no action.
      if (result.status === 'rejected') {
        this.fail(new Error(`Failed to initialize telemetry adapter "${exporters[index][0]}"`));
      }
    }
    // Disposal may have closed delivery while an asynchronous exporter initialized.
    if (this.value.status === 'disposed') {
      return;
    }
    this.#connections.add(this.#records.subscribe((record) => this.#deliver(record)));
    // Only a configured parent receives relayed records.
    if (parent) {
      this.#connections.add(this.#records.subscribe((record) => this.#relay(parent, record)));
    }
    this.#connections.add(this.#records.subscribe(({ item }) => this.#dispatchEvent(item)));
    // Keep subscriptions independent so a failed custom stream cannot terminate host lifecycle capture.
    if (this.#config.lifecycleItems$) {
      // The provider is the authority on host identity once it exists.
      this.#connections.add(
        this.#track(from(this.#config.lifecycleItems$).pipe(map((item) => this.#stamp(item)))),
      );
    }
    // Startup records passed at initialization are tracked as given.
    if (initialItems) {
      this.#connections.add(this.#track(initialItems));
    }
  }

  /**
   * Stamps this provider's host identity on a built-in lifecycle record, so records captured
   * before the provider existed share its source and host ID.
   * @param item - Captured lifecycle record.
   * @returns The record carrying this provider's identity and scope.
   */
  #stamp(item: TelemetryItem): TelemetryItem {
    const source = this.#context.owner.source;
    // Custom records and providers without identity are left as captured.
    if (!item.diagnostic || !source) {
      return item;
    }
    const { source: kind, hostId, hostName, hostVersion } = source;
    return {
      ...item,
      scope: operationalScope(source),
      diagnostic: { ...item.diagnostic, source: kind, hostId, hostName, hostVersion },
    };
  }

  /**
   * Tracks a startup stream through the public provider so each record is validated.
   * @param items - Startup records.
   * @returns The owned subscription.
   */
  #track(items: ObservableInput<TelemetryItem>): Subscription {
    return from(items).subscribe({
      next: (item) => this.#context.owner.track(item),
      error: () => this.fail(new Error('Initial telemetry stream failed')),
    });
  }

  /**
   * Delivers one record to every eligible exporter within per-exporter capacity.
   * @param record - Record and its fallback ownership.
   */
  #deliver({ item, handledByChild }: TelemetryRecord): void {
    const { adapter: adapterFilter } = this.#config.filter ?? {};
    try {
      // A host-level adapter filter intentionally rejects delivery without enabling fallback.
      if (adapterFilter && !adapterFilter(item)) {
        return;
      }
    } catch {
      this.fail(new Error('Telemetry adapter filter failed'));
      return;
    }
    // Every exporter is attempted independently.
    for (const [identifier, adapter] of Object.entries(this.#config.adapters)) {
      // Explicit child exporters take precedence over inherited development exporters.
      if (adapter.fallback && handledByChild) {
        // Keep application-owned records out of parent fallback exporters.
        continue;
      }
      // A slow exporter cannot consume a healthy sibling exporter's processing capacity.
      if ((this.value.processing[identifier] ?? 0) >= ADAPTER_PROCESSING_CAPACITY) {
        this.fail(new Error('Telemetry adapter processing capacity exceeded'));
        // Keep attempting sibling adapters even when this destination is saturated.
        continue;
      }
      try {
        const result = adapter.processItem(item);
        // Only asynchronous processing needs shutdown ownership and bounded pending capacity.
        if (result) {
          this.#subject.next(actions.processingStarted(identifier));
          Promise.resolve(result)
            .catch(() =>
              this.fail(new Error(`Failed to process telemetry item with adapter "${identifier}"`)),
            )
            .finally(() => this.#subject.next(actions.processingSettled(identifier)));
        }
      } catch {
        this.fail(new Error(`Failed to process telemetry item with adapter "${identifier}"`));
      }
    }
  }

  /**
   * Relays one record to the parent, carrying exporter ownership.
   * @param target - Parent provider.
   * @param record - Record and its fallback ownership.
   */
  #relay(target: ITelemetryProvider, { item, handledByChild }: TelemetryRecord): void {
    const policy = {
      // Carry exporter ownership across intermediate providers without changing record metadata.
      ownsExport: handledByChild || this.#config.ownsExport,
      relay: this.#config.filter?.relay,
    };
    try {
      // Legacy parents predate ownership; live relay keeps sending them every record.
      if (!relayRecord(target, item, policy)) {
        target.track(item);
      }
    } catch {
      this.fail(new Error('Telemetry parent relay failed'));
    }
  }

  /**
   * Dispatches one record as an event when an event bus is configured.
   * @param item - Delivered record.
   */
  #dispatchEvent(item: TelemetryItem): void {
    const { event, owner } = this.#context;
    // Only dispatch when an event provider is configured
    if (!event) {
      return;
    }
    try {
      Promise.resolve(event.dispatchEvent(new TelemetryEvent(item, owner))).catch(() =>
        this.fail(new Error('Telemetry event dispatch failed')),
      );
    } catch {
      this.fail(new Error('Telemetry event dispatch failed'));
    }
  }

  /** Releases delivery subscriptions and completes the record stream. */
  #close(): void {
    this.#connections.unsubscribe();
    this.#records.complete();
  }

  /**
   * Shuts down every exporter, even when one rejects or throws synchronously.
   * @throws {AggregateError} When any exporter fails to shut down.
   */
  async #shutdown(): Promise<void> {
    // Attempt every exporter; one failure must not skip the others.
    const shutdowns = Object.entries(this.#config.adapters).map(async ([identifier, adapter]) => {
      try {
        await adapter.shutdown?.();
      } catch (cause) {
        throw new Error(`Failed to shut down telemetry adapter "${identifier}"`, { cause });
      }
    });
    const results = await Promise.allSettled(shutdowns);
    // Keep only failures for the module lifecycle's structured disposal error event.
    const errors = results.flatMap((result) =>
      // Successful shutdowns must not obscure another exporter's failure.
      result.status === 'rejected' ? [result.reason] : [],
    );
    // Reject only after every exporter had a chance to release its resources.
    if (errors.length) {
      throw new AggregateError(errors, 'Failed to shut down telemetry adapters');
    }
  }

  /**
   * Reports a newly observed failure through the out-of-band health channel.
   * @param error - First occurrence of the failure.
   * @param status - Provider status when the failure was recorded.
   */
  #report(error: Error, status: TelemetryProviderStatus): void {
    const { event, owner } = this.#context;
    // The event bus is an out-of-band health sink, never an automatic telemetry exporter.
    if (event && status !== 'disposed') {
      try {
        Promise.resolve(event.dispatchEvent(new TelemetryErrorEvent(error, owner))).catch(() =>
          console.warn('Telemetry health event delivery failed'),
        );
      } catch {
        // A failed health channel must remain visible without recursively dispatching another event.
        console.warn('Telemetry health event delivery failed');
      }
    } else {
      console.warn(error.message);
    }
  }
}

export default TelemetryProviderState;
