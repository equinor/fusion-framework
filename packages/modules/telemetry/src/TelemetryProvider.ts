import {
  catchError,
  defer,
  from,
  of,
  timeout,
  type ObservableInput,
  Subject,
  Subscription,
  type Observable,
} from 'rxjs';
import type { z } from 'zod';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import type { TelemetryConfig } from './TelemetryConfigurator.interface.js';
import { version } from './version.js';
import { TelemetryType, TelemetryItemNames } from './static.js';
import type { ITelemetryAdapter } from './TelemetryAdapter.js';
import type { MetadataExtractor, TelemetryItem } from './types.js';
import {
  TelemetryExceptionSchema,
  TelemetryCustomEventSchema,
  TelemetryEventSchema,
  TelemetryMetricSchema,
  type TelemetryItemSchema,
} from './schemas.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { TelemetryErrorEvent, TelemetryEvent } from './TelemetryEvent.js';
import { Measurement } from './Measurement.js';
import { mergeTelemetryItem } from './utils/merge-telemetry-item.js';
import type { Modules, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { applyMetadata } from './utils/resolve-metadata.js';
import type { TelemetrySource } from './diagnostic-context.js';

/**
 * Provides telemetry tracking, event dispatching, and adapter integration for application instrumentation.
 *
 * The `TelemetryProvider` class is responsible for collecting, processing, and relaying telemetry data such as events,
 * exceptions, metrics, and custom events. It supports adapter-based processing, event provider integration, and
 * hierarchical telemetry relaying to parent providers. Telemetry items are validated and dispatched to registered
 * adapters and event providers, with robust error handling and metadata merging.
 *
 * @remarks
 * - Integrates with adapters for extensible telemetry processing.
 * - Supports event provider for dispatching telemetry as events.
 * - Allows relaying telemetry data to a parent provider, merging metadata as needed.
 * - Provides utility methods for tracking and measuring telemetry items.
 * - Handles error reporting via telemetry error events.
 *
 * @example
 * ```typescript
 * const provider = new TelemetryProvider(config, { event: eventProvider });
 * provider.track({ type: TelemetryType.Event, name: 'user_login', metadata: { userId: '123' } });
 * const end = provider.measure({ name: 'load_time' });
 * // ... do work ...
 * end();
 * ```
 *
 * @typeParam TelemetryConfig - The configuration type for telemetry.
 * @implements ITelemetryProvider
 * @extends BaseModuleProvider<TelemetryConfig>
 */
export class TelemetryProvider
  extends BaseModuleProvider<TelemetryConfig>
  implements ITelemetryProvider
{
  #items: Subject<TelemetryItem> = new Subject();

  #initialized = false;
  #disposal?: Promise<void>;
  #initialization?: Promise<void>;
  #closed = false;
  #disposing = false;
  #metadataSubscriptions = new Subscription();
  #builtInMetadata = new Set<Subscription>();
  #processing = new Set<Promise<void>>();
  #pendingByAdapter = new Map<string, number>();
  #failures = new Map<string, number>();
  #pendingMetadata = 0;
  /** Immutable composition-root origin used by optional infrastructure reporters. */
  readonly source: TelemetrySource;
  #ownsExport: boolean;

  #adapters: Record<string, ITelemetryAdapter> = {};
  #handledByChild = new WeakSet<TelemetryItem>();
  #filters?: {
    adapter?: (item: TelemetryItem) => boolean;
    relay?: (item: TelemetryItem) => boolean;
  };

  #defaultScope: string[];

  #eventProvider: IEventModuleProvider | undefined;

  /**
   * Stream of every telemetry item tracked by this provider.
   *
   * @returns An observable emitting each tracked `TelemetryItem`.
   */
  get items(): Observable<TelemetryItem> {
    return this.#items.asObservable();
  }

  /**
   * Returns true if the provider has been initialized.
   *
   * @returns `true` when {@link initialize} has completed, otherwise `false`.
   */
  get initialized(): boolean {
    return this.#initialized;
  }

  #metadata?: MetadataExtractor;

  #modules: ModulesInstanceType<Modules> | undefined;
  /**
   * Sets the resolved framework module instances used to resolve metadata.
   *
   * @param value - The resolved framework module instances.
   */
  set modules(value: ModulesInstanceType<Modules>) {
    this.#modules = value;
  }

  /**
   * Creates a new `TelemetryProvider`.
   *
   * @param config - Resolved telemetry configuration (adapters, metadata, scope, filters).
   * @param deps - Optional dependencies; supply an event module provider to dispatch
   *   telemetry items as events.
   */
  constructor(config: TelemetryConfig, deps?: { event?: IEventModuleProvider }) {
    super({ version, config });

    this.#adapters = config?.adapters ?? {};
    this.#metadata = config?.metadata;
    this.#defaultScope = config?.defaultScope ?? [];
    this.#eventProvider = deps?.event;
    this.#filters = config?.filter;
    this.source = Object.freeze(
      config.source ?? { source: 'framework', hostId: crypto.randomUUID() },
    );
    // Configuration, not delivery success, determines inherited fallback suppression.
    this.#ownsExport =
      config.ownsExport ?? Object.values(this.#adapters).some((adapter) => !adapter.fallback);
  }

  /**
   * Initializes the telemetry provider with adapters, parent provider, and optional initial items.
   *
   * This method sets up the provider for operation by:
   * 1. Storing the provided adapters
   * 2. Initializing all adapters that support async initialization (failures are logged but don't prevent initialization)
   * 3. Setting up subscriptions for telemetry processing
   * 4. Handling initial telemetry items if provided
   *
   * @param args - Initialization arguments
   * @param args.adapters - Array of telemetry adapters to use
   * @param args.parent - Optional parent telemetry provider for relaying data
   * @param args.initialItems - Optional observable of initial telemetry items to process
   * @returns A promise that resolves when initialization is complete
   */
  public initialize(args?: {
    parent?: ITelemetryProvider;
    initialItems?: ObservableInput<TelemetryItem>;
  }): Promise<void> {
    // A disposed provider must not reconnect exporters or event subscriptions.
    if (this.#closed) {
      return Promise.reject(new Error('Cannot initialize disposed telemetry'));
    }
    this.#initialization ??= Promise.resolve().then(() => this._initialize(args));
    return this.#initialization;
  }

  /**
   * Connects a provider once so repeated initialization joins the same work.
   * @param args - Optional parent and startup stream.
   */
  protected async _initialize(args?: {
    parent?: ITelemetryProvider;
    initialItems?: ObservableInput<TelemetryItem>;
  }): Promise<void> {
    const { parent, initialItems } = args ?? {};

    // Mark as initialized early to allow adapter connections
    this.#initialized = true;

    // Initialize all adapters that support async initialization
    await this._initializeAdapters();
    // Disposal may have been requested while an asynchronous exporter initialized.
    if (this.#closed) {
      return;
    }

    // Connect adapters to the telemetry items, processing each item as it is emitted
    this._addTeardown(this._connectAdapters());

    // If a parent telemetry provider is provided, relay telemetry data to it
    if (parent) {
      this._addTeardown(this._relayTelemetryData(parent));
    }

    // Emit telemetry items as events if an event provider is available
    this._addTeardown(this.#items.subscribe(this._dispatchEntityEvent.bind(this)));

    // Handle initial telemetry items if provided
    if (initialItems) {
      this._addTeardown(
        from(initialItems).subscribe({
          next: (item) => this.track(item),
          error: () => this._dispatchError(new Error('Initial telemetry stream failed')),
        }),
      );
    }

    // Ensure the subject is completed when the provider is destroyed
    this._addTeardown(() => {
      this.#items.complete();
    });
  }

  /**
   * Stops telemetry subscriptions and waits for every adapter to flush and shut down.
   *
   * Repeated calls share the same completion promise so exporters are shut down only once.
   * The telemetry module awaits this promise during framework module disposal.
   *
   * @returns Resolves after all adapter shutdowns settle.
   * @throws {AggregateError} When any adapter fails to shut down; all adapters are still attempted.
   * @example
   * ```ts
   * await provider.dispose();
   * ```
   */
  public override dispose(): Promise<void> {
    // Direct disposal and module disposal must join the same pending shutdown.
    if (this.#disposal) {
      return this.#disposal;
    }
    // Defer adapter callbacks until the shared promise is assigned, including reentrant disposal.
    this.#disposing = true;
    this.#disposal = Promise.resolve().then(async () => {
      await Promise.allSettled([this.#initialization]);
      // Built-in enrichment has a deadline; retain terminal teardown records before flushing.
      await Promise.all(
        [...this.#builtInMetadata].map(
          (subscription) => new Promise<void>((resolve) => subscription.add(resolve)),
        ),
      );
      this.#closed = true;
      this.#metadataSubscriptions.unsubscribe();
      super.dispose();
      await Promise.allSettled(this.#processing);
      // Repeated failures stay visible without emitting one event per failed record.
      for (const [failure, count] of this.#failures) {
        // A single occurrence was already reported; summarize only repeated failures.
        if (count > 1) {
          console.warn('Telemetry pipeline failure summary', { failure, count });
        }
      }
      // Shut down all exporters even when one rejects or throws synchronously.
      const results = await Promise.allSettled(
        Object.entries(this.#adapters).map(async ([identifier, adapter]) => {
          try {
            await adapter.shutdown?.();
          } catch (cause) {
            throw new Error(`Failed to shut down telemetry adapter "${identifier}"`, { cause });
          }
        }),
      );
      const errors: unknown[] = [];
      // Retain each failure for the module lifecycle's structured disposal error event.
      for (const result of results) {
        // Successful shutdowns must not obscure another exporter's failure.
        if (result.status === 'rejected') {
          errors.push(result.reason);
        }
      }
      // Reject only after all exporters have had a chance to release their resources.
      if (errors.length) {
        throw new AggregateError(errors, 'Failed to shut down telemetry adapters');
      }
    });
    return this.#disposal;
  }

  /**
   * Initializes all telemetry adapters that support async initialization.
   * Uses Promise.allSettled to ensure all adapters attempt initialization,
   * with individual error reporting for any failures.
   * Subclasses can override this method to customize adapter initialization behavior.
   *
   * @protected
   */
  protected async _initializeAdapters(): Promise<void> {
    // Initialize all adapters, do it in parallel
    const adapterEntries = Object.entries(this.#adapters);
    // Kick off every adapter's initialize() concurrently
    const initializationPromises = adapterEntries.map(
      async ([_identifier, adapter]) => await adapter.initialize(),
    );

    // Wait for all adapters to settle (either resolve or reject)
    const results = await Promise.allSettled(initializationPromises);

    // Check each result and dispatch errors for failed initializations
    for (const [index, result] of results.entries()) {
      // Only rejected adapters need an error dispatched; fulfilled ones need no action
      if (result.status === 'rejected') {
        const [identifier] = adapterEntries[index];
        this._dispatchError(new Error(`Failed to initialize telemetry adapter "${identifier}"`));
      }
    }
  }

  /**
   * Subscribes all adapters to the telemetry item stream.
   * Each adapter processes every telemetry item as it is emitted.
   * If an adapter filter is configured, only items that pass the filter will be sent to adapters.
   * If an adapter throws, the error is dispatched as a telemetry error event.
   *
   * @returns Subscription to the telemetry item stream
   * @protected
   * @throws {Error} When the provider has not been initialized yet.
   */
  protected _connectAdapters(): Subscription {
    // Adapters can only be connected after the provider has completed initialization
    if (!this.#initialized) {
      throw new Error('TelemetryProvider is not initialized');
    }
    return this.#items.subscribe((item) => {
      const { adapter: adapterFilter } = this.#filters ?? {};
      // Apply adapter filter if configured - skip item if filter returns false
      try {
        // A host-level adapter filter intentionally rejects delivery without enabling fallback.
        if (adapterFilter && !adapterFilter(item)) {
          return;
        }
      } catch {
        this._dispatchError(new Error('Telemetry adapter filter failed'));
        return;
      }

      // Iterate through all registered adapters
      for (const [identifier, adapter] of Object.entries(this.#adapters)) {
        // Explicit child exporters take precedence over inherited development exporters.
        if (adapter.fallback && this.#handledByChild.has(item)) {
          // Keep application-owned records out of parent fallback exporters.
          continue;
        }
        // A slow exporter cannot consume a healthy sibling exporter's processing capacity.
        if ((this.#pendingByAdapter.get(identifier) ?? 0) >= 256) {
          this._dispatchError(new Error('Telemetry adapter processing capacity exceeded'));
          // Keep attempting sibling adapters even when this destination is saturated.
          continue;
        }
        try {
          // Let the adapter process the telemetry item
          const result = adapter.processItem(item);
          // Only asynchronous processing needs shutdown ownership and bounded pending capacity.
          if (result) {
            this.#pendingByAdapter.set(
              identifier,
              (this.#pendingByAdapter.get(identifier) ?? 0) + 1,
            );
            const pending = Promise.resolve(result)
              .catch(() => {
                this._dispatchError(
                  new Error(`Failed to process telemetry item with adapter "${identifier}"`),
                );
              })
              .finally(() => {
                this.#processing.delete(pending);
                this.#pendingByAdapter.set(
                  identifier,
                  (this.#pendingByAdapter.get(identifier) ?? 1) - 1,
                );
              });
            this.#processing.add(pending);
          }
        } catch {
          // If processing fails, dispatch an error event
          this._dispatchError(
            new Error(`Failed to process telemetry item with adapter "${identifier}"`),
          );
        }
      }
    });
  }

  /**
   * Relays telemetry data items to a target telemetry provider.
   *
   * Subscribes to the internal telemetry item stream and forwards each processed item
   * to the specified target provider by invoking its `track` method.
   * If a relay filter is configured, only items that pass the filter will be relayed.
   *
   * @param target - The telemetry provider to which telemetry data should be relayed.
   * @returns A Subscription object that can be used to unsubscribe from the relay.
   */
  protected _relayTelemetryData(target: ITelemetryProvider): Subscription {
    // Subscribe to the processed stream and forward each item to the parent provider
    return this.#items.subscribe((item) => {
      const { relay: relayFilter } = this.#filters ?? {};
      // Apply relay filter if configured - skip item if filter returns false
      try {
        // Reject intentionally filtered records without changing export ownership.
        if (relayFilter && !relayFilter(item)) {
          return;
        }
        // New providers preserve ownership; legacy parents retain their track-only contract.
        if (target.trackRelayed) {
          // Carry exporter ownership across intermediate providers without changing record metadata.
          const hasAdapters = this.#handledByChild.has(item) || this.#ownsExport;
          target.trackRelayed(item, hasAdapters);
        } else {
          target.track(item);
        }
      } catch {
        this._dispatchError(new Error('Telemetry parent relay failed'));
      }
    });
  }

  /**
   * Dispatches a telemetry event to the event provider, if available.
   *
   * @param item - The telemetry item to dispatch as an event
   * @protected
   */
  protected _dispatchEntityEvent(item: TelemetryItem): void {
    // Only dispatch when an event provider is configured
    if (this.#eventProvider) {
      try {
        Promise.resolve(this.#eventProvider.dispatchEvent(new TelemetryEvent(item, this))).catch(
          () => this._dispatchError(new Error('Telemetry event dispatch failed')),
        );
      } catch {
        this._dispatchError(new Error('Telemetry event dispatch failed'));
      }
    }
  }

  /**
   * Dispatches a telemetry error event using the internal event provider, if available.
   *
   * @param error - The error instance to be dispatched with the telemetry error event.
   * @protected
   */
  protected _dispatchError(error: Error): void {
    const count = (this.#failures.get(error.message) ?? 0) + 1;
    this.#failures.set(error.message, count);
    // First occurrence is actionable; repeats are counted for one teardown summary.
    if (count !== 1) {
      return;
    }
    // The event bus is an out-of-band health sink, never an automatic telemetry exporter.
    if (this.#eventProvider && !this.#closed) {
      try {
        Promise.resolve(
          this.#eventProvider.dispatchEvent(new TelemetryErrorEvent(error, this)),
        ).catch(() => console.warn('Telemetry health event delivery failed'));
      } catch {
        // A failed health channel must remain visible without recursively dispatching another event.
        console.warn('Telemetry health event delivery failed');
      }
    } else {
      console.warn(error.message);
    }
  }

  /**
   * Tracks a telemetry item by type, merging the default scope with the provided scope.
   * Dispatches the item to the appropriate handler based on its type.
   *
   * @param item - The telemetry item to track
   * @example
   * provider.track({
   *   type: TelemetryType.Event,
   *   name: 'user_login',
   *   metadata: { userId: '123' }
   * });
   */
  public track(item: z.input<typeof TelemetryItemSchema>): void {
    // Dispatch to the type-specific tracker so each item is validated with the right schema
    switch (item.type) {
      case TelemetryType.Event:
        this.trackEvent(item);
        break;
      case TelemetryType.Exception:
        this.trackException(item as z.input<typeof TelemetryExceptionSchema>);
        break;
      case TelemetryType.Metric:
        this.trackMetric(item as z.input<typeof TelemetryMetricSchema>);
        break;
      case TelemetryType.Custom:
        this.trackCustom(item as z.input<typeof TelemetryCustomEventSchema>);
        break;
    }
  }

  /**
   * Tracks an already validated child record, suppressing fallback exporters when appropriate.
   *
   * @param item - Record emitted by a child telemetry provider.
   * @param hasAdapters - Whether an explicit child adapter has already handled this record.
   */
  public trackRelayed(item: TelemetryItem, hasAdapters: boolean): void {
    this._track(item, hasAdapters);
  }

  /**
   * Tracks a telemetry item by merging the default scope with the item's scope (if provided),
   * ensuring that all telemetry items have the correct scope context. The merged item is then
   * emitted to downstream handlers.
   *
   * @param item - The telemetry item to be tracked, conforming to the input schema of `TelemetryItemSchema`.
   * @param handledByChild - Whether fallback adapters should skip this relayed item.
   *
   * @protected
   */
  protected _track(item: z.input<typeof TelemetryItemSchema>, handledByChild = false): void {
    // Stop accepting records before flushing, while allowing already-owned enrichment to settle.
    if (this.#closed || this.#disposing) {
      return;
    }
    const mergedItem = mergeTelemetryItem(item, {
      scope: item.diagnostic ? undefined : this.#defaultScope,
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
      // Dynamic metadata is consumer-controlled; built-in records export only their safe envelope.
      const record = operational ?? nextItem;
      // Ownership must follow the enriched object identity across asynchronous parent relays.
      if (handledByChild) {
        this.#handledByChild.add(record);
      }
      // Late custom metadata emissions cannot revive a completed provider.
      if (!this.#closed) {
        this.#items.next(record);
      }
    };

    // Skip metadata application for TelemetryMetadataError items to prevent infinite recursion
    if (this.#metadata && mergedItem.name !== TelemetryItemNames.MetadataError) {
      // Bounded built-in enrichment degrades to the safe original instead of dropping the outcome.
      if (diagnostic && this.#pendingMetadata >= 256) {
        this._dispatchError(new Error('Built-in telemetry metadata capacity exceeded'));
        emit(mergedItem);
        return;
      }
      this.#pendingMetadata++;
      let metadata$ = defer(() =>
        applyMetadata(this.#metadata, {
          modules: this.#modules,
          item: mergedItem,
        }),
      );
      // Custom records retain their legacy timing; built-in outcomes have a finite enrichment deadline.
      if (diagnostic) {
        // Timeout cancels the metadata source before replaying the original safe record.
        metadata$ = metadata$.pipe(timeout({ first: 1_000 }));
      }
      // Failure recovery preserves the terminal outcome even when metadata throws or times out.
      const subscription = metadata$
        .pipe(
          catchError(() => {
            this._dispatchError(new Error('Telemetry metadata resolution failed'));
            return of(mergedItem);
          }),
        )
        .subscribe({
          next: (nextItem) => {
            // Raw enrichment errors are health failures, not exportable built-in exceptions.
            if (diagnostic && nextItem.name === TelemetryItemNames.MetadataError) {
              this._dispatchError(new Error('Telemetry metadata resolution failed'));
              return;
            }
            emit(nextItem);
          },
          error: () => {
            this._dispatchError(new Error('Telemetry metadata resolution failed'));
            emit(mergedItem);
          },
        });
      this.#metadataSubscriptions.add(subscription);
      // Only live bounded enrichment participates in the shutdown wait.
      if (diagnostic && !subscription.closed) {
        this.#builtInMetadata.add(subscription);
      }
      subscription.add(() => {
        this.#pendingMetadata--;
        this.#builtInMetadata.delete(subscription);
        this.#metadataSubscriptions.remove(subscription);
      });
    } else {
      // Providers without metadata still need the same fallback precedence.
      emit(mergedItem);
    }
  }

  /**
   * Starts a metric measurement and returns a function to end the measurement.
   * When the returned function is called, it will end the metric and optionally merge additional data.
   *
   * @param data - The initial metric data (without type)
   * @returns A function to end the metric, optionally with additional data
   * @example
   * const end = provider.measure({ name: 'load_time', metadata: { page: 'home' } });
   * // ... code to measure ...
   * end();
   * // or with additional data:
   * end({ metadata: { user: 'abc' } });
   */
  public measure(
    data: Omit<z.input<typeof TelemetryItemSchema>, 'type'>,
  ): ReturnType<ITelemetryProvider['measure']> {
    return new Measurement(this, data);
  }

  /**
   * Tracks a telemetry event.
   *
   * @param data - The event data (without type)
   * @example
   * provider.trackEvent({ name: 'button_click', metadata: { button: 'save' } });
   */
  public trackEvent(data: Omit<z.input<typeof TelemetryEventSchema>, 'type'>): void {
    this._track(TelemetryEventSchema.parse({ ...data, type: TelemetryType.Event }));
  }

  /**
   * Tracks a telemetry exception.
   *
   * @param data - The exception data (without type)
   * @example
   * provider.trackException({
   *   name: 'api_error',
   *   exception: new Error('API failed'),
   *   metadata: { code: 500 }
   * });
   */
  public trackException(data: Omit<z.input<typeof TelemetryExceptionSchema>, 'type'>): void {
    this._track(TelemetryExceptionSchema.parse({ ...data, type: TelemetryType.Exception }));
  }

  /**
   * Tracks a telemetry metric.
   *
   * @param data - The metric data (without type)
   * @example
   * provider.trackMetric({ name: 'response_time', value: 123 });
   */
  public trackMetric(data: Omit<z.input<typeof TelemetryMetricSchema>, 'type'>): void {
    this._track(TelemetryMetricSchema.parse({ ...data, type: TelemetryType.Metric }));
  }

  /**
   * Tracks a custom telemetry event.
   *
   * @param data - The custom event data (without type)
   * @example
   * provider.trackCustom({ name: 'custom_event', metadata: { foo: 'bar' } });
   */
  public trackCustom(data: Omit<z.input<typeof TelemetryCustomEventSchema>, 'type'>): void {
    this._track(TelemetryCustomEventSchema.parse({ ...data, type: TelemetryType.Custom }));
  }

  /**
   * Retrieves a telemetry adapter by its identifier.
   *
   * @typeParam T - The key of the `TelemetryAdapter` to retrieve.
   * @param identifier - The identifier of the telemetry adapter to retrieve.
   * @returns The telemetry adapter corresponding to the given identifier, or `undefined` if not found.
   */
  public getAdapter(identifier: string): ITelemetryAdapter | undefined {
    const adapter = this.#adapters[identifier];
    // Report a missing adapter as a telemetry exception rather than throwing
    if (!adapter) {
      this.trackException({
        name: 'TelemetryAdapterNotFound',
        exception: new Error(`Telemetry adapter "${identifier}" not found`),
        metadata: {
          identifier,
        },
      });
    }
    return adapter;
  }

  /**
   * Check if a telemetry adapter exists by its identifier.
   * @param identifier - The unique identifier of the telemetry adapter to check.
   * @returns True if the adapter exists, false otherwise.
   */
  public hasAdapter(identifier: string): boolean {
    return identifier in this.#adapters;
  }
}
