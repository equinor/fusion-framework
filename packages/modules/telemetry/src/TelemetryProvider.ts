import deepmerge from 'deepmerge';
import { concatMap, Subject, type Observable, type Subscription } from 'rxjs';
import type { z } from 'zod';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type {
  EventModuleProvider,
  IEventModuleProvider,
} from '@equinor/fusion-framework-module-event';
import type { DynamicInputValue } from '@equinor/fusion-observable';

import type { MetaData, TelemetryConfig } from './TelemetryConfigurator.interface.js';
import { version } from './version.js';
import { TelemetryType } from './static.js';
import type { TelemetryAdapter, TelemetryItem } from './types.js';
import {
  TelemetryExceptionSchema,
  TelemetryCustomEventSchema,
  TelemetryEventSchema,
  TelemetryMetricSchema,
  type TelemetryItemSchema,
} from './schemas.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { TelemetryErrorEvent, TelemetryEvent } from './events.js';
import { mergeMetadata, resolveMetadataAsync } from './metadata.js';

export class TelemetryProvider
  extends BaseModuleProvider<TelemetryConfig>
  implements ITelemetryProvider
{
  #items: Subject<TelemetryItem> = new Subject();
  #adapters: Array<TelemetryAdapter>;
  #startTimes: Map<string, number> = new Map();

  #defaultScope: string[];

  #eventProvider: IEventModuleProvider | undefined;

  get items(): Observable<TelemetryItem> {
    return this.#items.asObservable();
  }

  #metadata: DynamicInputValue<MetaData> | undefined;
  get metadata(): Promise<MetaData> {
    return resolveMetadataAsync(this.#metadata).then((value) => value ?? {});
  }

  constructor(
    config: TelemetryConfig,
    args?: { event?: EventModuleProvider; parent?: ITelemetryProvider },
  ) {
    super({ version, config });

    this.#adapters = config?.adapters ?? [];
    this.#metadata = config?.metadata;
    this.#defaultScope = config?.defaultScope ?? [];

    this.#eventProvider = args?.event;

    this._initialize(args?.parent);
  }

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
   * Relays telemetry data to a parent provider, merging metadata from config and item.
   * If metadata resolution fails, dispatches an error and falls back to the original item.
   *
   * @param target - The parent telemetry provider to relay data to
   * @returns Subscription to the relayed telemetry item stream
   */
  protected _relayTelemetryData(target: ITelemetryProvider): Subscription {
    // Use concatMap to handle async metadata resolution for each item
    const items$ = this.#items.pipe(
      concatMap(async (item) => {
        try {
          // Merge config metadata and item metadata (item metadata takes precedence)
          const metadata = mergeMetadata(await this.metadata, item.metadata);
          return { ...item, metadata };
        } catch (error) {
          // If metadata resolution fails, dispatch an error and use the original item
          this._dispatchError(
            new Error(`Failed to resolve metadata for telemetry item "${item.name}"`, {
              cause: error,
            }),
          );
          return item; // Fallback to item without metadata
        }
      }),
    );
    // Subscribe to the processed stream and forward each item to the parent provider
    return items$.subscribe((item) => target.track(item));
  }

  /**
   * Dispatches a telemetry event to the event provider, if available.
   *
   * @param item - The telemetry item to dispatch as an event
   */
  protected _dispatchEntityEvent(item: TelemetryItem): void {
    if (this.#eventProvider) {
      // Wrap the telemetry item in a TelemetryEvent and dispatch it
      this.#eventProvider.dispatchEvent(new TelemetryEvent(item, this));
    }
  }

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
    // Deconstruct the telemetry item to separate the type from the rest of the properties.
    // This allows us to handle the item based on its type, while passing the remaining properties
    // (such as name, metadata, etc.) to the appropriate handler. The rest object is also used to
    // merge/extend the scope with the default scope for consistent scoping across all telemetry items.
    const { type, ...rest } = item;
    // Merge the default scope with any scope provided in the item, ensuring all items have the correct scope context.
    const defaultScope = new Set([...this.#defaultScope, ...(rest.scope ?? [])]);
    // Reconstruct the entry with the merged scope for downstream handlers.
    const entry = { type, ...rest, scope: defaultScope };
    // Dispatch to the correct handler based on the telemetry type.
    switch (type) {
      case TelemetryType.Event:
        this.trackEvent(entry);
        break;
      case TelemetryType.Exception:
        this.trackException(entry as z.input<typeof TelemetryExceptionSchema>);
        break;
      case TelemetryType.Metric:
        this.trackMetric(entry as z.input<typeof TelemetryMetricSchema>);
        break;
      case TelemetryType.Custom:
        this.trackCustom(entry as z.input<typeof TelemetryCustomEventSchema>);
        break;
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
  ): (data?: Omit<z.input<typeof TelemetryItemSchema>, 'type'>) => void {
    this.startMetric(data);
    return (endData?: Omit<z.input<typeof TelemetryItemSchema>, 'type' | 'name'>) => {
      if (endData) {
        this.endMetric(
          deepmerge(data, endData) as Omit<z.input<typeof TelemetryItemSchema>, 'type'>,
        );
      } else {
        this.endMetric(data);
      }
    };
  }

  /**
   * Tracks a telemetry event.
   *
   * @param data - The event data (without type)
   * @example
   * provider.trackEvent({ name: 'button_click', metadata: { button: 'save' } });
   */
  public trackEvent(data: Omit<z.input<typeof TelemetryEventSchema>, 'type'>): void {
    this.#items.next(TelemetryEventSchema.parse({ ...data, type: TelemetryType.Event }));
  }

  /**
   * Tracks a telemetry exception.
   *
   * @param data - The exception data (without type)
   * @example
   * provider.trackException({ name: 'api_error', metadata: { code: 500 } });
   */
  public trackException(data: Omit<z.input<typeof TelemetryExceptionSchema>, 'type'>): void {
    this.#items.next(TelemetryExceptionSchema.parse({ ...data, type: TelemetryType.Exception }));
  }

  /**
   * Tracks a telemetry metric.
   *
   * @param data - The metric data (without type)
   * @example
   * provider.trackMetric({ name: 'response_time', value: 123 });
   */
  public trackMetric(data: Omit<z.input<typeof TelemetryMetricSchema>, 'type'>): void {
    this.#items.next(TelemetryMetricSchema.parse({ ...data, type: TelemetryType.Metric }));
  }

  /**
   * Tracks a custom telemetry event.
   *
   * @param data - The custom event data (without type)
   * @example
   * provider.trackCustom({ name: 'custom_event', metadata: { foo: 'bar' } });
   */
  public trackCustom(data: Omit<z.input<typeof TelemetryCustomEventSchema>, 'type'>): void {
    this.#items.next(TelemetryCustomEventSchema.parse({ ...data, type: TelemetryType.Custom }));
  }

  /**
   * Starts timing a metric. Stores the start time for the given metric name.
   * Returns a function that, when called, ends the metric.
   *
   * @param data - The metric data (without type)
   * @returns A function to end the metric
   * @example
   * const end = provider.startMetric({ name: 'db_query' });
   * // ...
   * end();
   */
  public startMetric(data: Omit<z.input<typeof TelemetryItemSchema>, 'type'>): VoidFunction {
    // @todo - check if name is already started
    this.#startTimes.set(data.name, performance.now());
    return () => this.endMetric(data);
  }

  /**
   * Ends a metric measurement, calculates the duration, and tracks the metric.
   * If the metric was not started, logs a warning.
   *
   * @param data - The metric data (without type)
   * @example
   * provider.endMetric({ name: 'db_query' });
   */
  public endMetric(data: Omit<z.input<typeof TelemetryItemSchema>, 'type'>): void {
    const startTime = this.#startTimes.get(data.name);
    if (startTime === undefined) {
      this._dispatchError(new Error(`Metric "${data.name}" was not started. Cannot end metric.`));
      return;
    }
    const duration = performance.now() - startTime;
    this.#startTimes.delete(data.name);

    this.trackMetric({
      ...data,
      value: duration,
    });
  }
}
