import { from, Subject, type Observable, type Subscription } from 'rxjs';
import type { z } from 'zod';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import type { TelemetryConfig } from './TelemetryConfigurator.interface.js';
import { version } from './version.js';
import { TelemetryType } from './static.js';
import type {
  MetadataExtractor,
  TelemetryAdapter,
  TelemetryAdapters,
  TelemetryItem,
} from './types.js';
import {
  TelemetryExceptionSchema,
  TelemetryCustomEventSchema,
  TelemetryEventSchema,
  TelemetryMetricSchema,
  type TelemetryItemSchema,
} from './schemas.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { TelemetryErrorEvent, TelemetryEvent } from './events.js';
import { Measurement } from './Measurement.js';
import { mergeTelemetryItem } from './utils/merge-telemetry-item.js';
import type { Modules, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { applyMetadata } from './utils/resolve-metadata.js';

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
  #adapters: Array<TelemetryAdapter>;

  #defaultScope: string[];

  #eventProvider: IEventModuleProvider | undefined;

  get items(): Observable<TelemetryItem> {
    return this.#items.asObservable();
  }

  #metadata?: MetadataExtractor;

  #modules: ModulesInstanceType<Modules> | undefined;
  set modules(value: ModulesInstanceType<Modules>) {
    this.#modules = value;
  }

  constructor(config: TelemetryConfig, deps?: { event?: IEventModuleProvider }) {
    super({ version, config });

    this.#adapters = config?.adapters ?? [];
    this.#metadata = config?.metadata;
    this.#defaultScope = config?.defaultScope ?? [];

    this.#eventProvider = deps?.event;

    this._initialize(config.parent);

    if (config.items$) {
      this._addTeardown(
        from(config.items$).subscribe((item) => {
          this.track(item);
        }),
      );
    }
  }

  /**
   * Initializes the telemetry provider by setting up necessary connections and teardown logic.
   *
   * @param parent Optional parent telemetry provider to which telemetry data can be relayed.
   *
   * - Connects adapters to process emitted telemetry items.
   * - Emits telemetry items as events if an event provider is available.
   * - Relays telemetry data to the parent provider if provided.
   * - Ensures the internal subject is completed when the provider is destroyed.
   *
   * @protected
   */
  protected _initialize(parent?: ITelemetryProvider): void {
    // Connect adapters to the telemetry items, processing each item as it is emitted
    this._addTeardown(this._connectAdapters());

    // Emit telemetry items as events if an event provider is available
    this._addTeardown(this.#items.subscribe(this._dispatchEntityEvent.bind(this)));

    if (parent) {
      // If a parent telemetry provider is provided, relay telemetry data to it
      this._addTeardown(this._relayTelemetryData(parent));
    }

    // Ensure the subject is completed when the provider is destroyed
    this._addTeardown(() => {
      this.#items.complete();
    });
  }

  /**
   * Subscribes all adapters to the telemetry item stream.
   * Each adapter processes every telemetry item as it is emitted.
   * If an adapter throws, the error is dispatched as a telemetry error event.
   *
   * @returns Subscription to the telemetry item stream
   * @protected
   */
  protected _connectAdapters(): Subscription {
    return this.#items.subscribe((item) => {
      // Iterate through all registered adapters
      for (const adapter of this.#adapters) {
        try {
          // Let the adapter process the telemetry item
          adapter.processItem(item);
        } catch (error) {
          // If processing fails, dispatch an error event
          this._dispatchError(
            new Error(`Failed to process telemetry item with adapter "${adapter.identifier}"`, {
              cause: error,
            }),
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
   *
   * @param target - The telemetry provider to which telemetry data should be relayed.
   * @returns A Subscription object that can be used to unsubscribe from the relay.
   */
  protected _relayTelemetryData(target: ITelemetryProvider): Subscription {
    // Subscribe to the processed stream and forward each item to the parent provider
    return this.#items.subscribe((item) => target.track(item));
  }

  /**
   * Dispatches a telemetry event to the event provider, if available.
   *
   * @param item - The telemetry item to dispatch as an event
   * @protected
   */
  protected _dispatchEntityEvent(item: TelemetryItem): void {
    if (this.#eventProvider) {
      // Wrap the telemetry item in a TelemetryEvent and dispatch it
      this.#eventProvider.dispatchEvent(new TelemetryEvent(item, this));
    }
  }

  /**
   * Dispatches a telemetry error event using the internal event provider, if available.
   *
   * @param error - The error instance to be dispatched with the telemetry error event.
   * @protected
   */
  protected _dispatchError(error: Error): void {
    if (this.#eventProvider) {
      this.#eventProvider.dispatchEvent(new TelemetryErrorEvent(error, this));
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
   * Tracks a telemetry item by merging the default scope with the item's scope (if provided),
   * ensuring that all telemetry items have the correct scope context. The merged item is then
   * emitted to downstream handlers.
   *
   * @param item - The telemetry item to be tracked, conforming to the input schema of `TelemetryItemSchema`.
   *
   * @protected
   */
  protected async _track(item: z.input<typeof TelemetryItemSchema>): Promise<void> {
    const mergedItem = mergeTelemetryItem(item, {
      scope: this.#defaultScope,
    });
    if (this.#metadata) {
      applyMetadata(this.#metadata, {
        modules: this.#modules,
        item: mergedItem,
      }).subscribe((nextItem) => {
        // Emit the item after applying metadata
        this.#items.next(nextItem);
      });
    } else {
      // If no metadata extractor is provided, emit the item directly
      this.#items.next(mergedItem);
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
   * provider.trackException({ name: 'api_error', metadata: { code: 500 } });
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
  public getAdapter<T extends keyof TelemetryAdapters>(
    identifier: T,
  ): TelemetryAdapters[T] | undefined {
    return this.#adapters.find((adapter) => adapter.identifier === identifier) as
      | TelemetryAdapters[T]
      | undefined;
  }
}
