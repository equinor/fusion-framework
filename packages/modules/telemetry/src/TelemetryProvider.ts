import type { z } from 'zod';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { Modules, ModulesInstanceType } from '@equinor/fusion-framework-module';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import type { TelemetryConfig } from './TelemetryConfigurator.interface.js';
import { version } from './version.js';
import { TelemetryType } from './static.js';
import type { ITelemetryAdapter } from './TelemetryAdapter.js';
import type { TelemetryItem } from './types.js';
import {
  TelemetryExceptionSchema,
  TelemetryCustomEventSchema,
  TelemetryEventSchema,
  TelemetryMetricSchema,
  type TelemetryItemSchema,
} from './schemas/telemetry-item-schema.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { Measurement } from './Measurement.js';
import type { TelemetrySource } from './schemas/diagnostic-context.js';
import type { Observable } from 'rxjs';
import { TelemetryProviderState } from './TelemetryProviderState.js';
import type { TelemetryInitializeArgs } from './TelemetryProviderState.actions.js';
import {
  createOperationalTelemetry,
  type OperationalTelemetry,
  type OperationalTelemetryOptions,
} from './utils/create-operational-telemetry.js';

/**
 * The telemetry provider applications and modules use to track events, exceptions, metrics
 * and custom telemetry.
 *
 * `TelemetryProvider` is a thin, consumer-facing facade: it validates input against the item
 * schemas and delegates everything else (scope, enrichment, exporter delivery, parent relay,
 * lifecycle and health) to its {@link TelemetryProviderState} engine.
 *
 * @example
 * ```typescript
 * const provider = new TelemetryProvider(config, { event: eventProvider });
 * await provider.initialize({ parent });
 * provider.trackEvent({ name: 'user_login', metadata: { userId: '123' } });
 * const end = provider.measure({ name: 'load_time' });
 * // ... do work ...
 * end();
 * await provider.dispose();
 * ```
 */
export class TelemetryProvider
  extends BaseModuleProvider<TelemetryConfig>
  implements ITelemetryProvider
{
  /** Immutable composition-root origin used by optional infrastructure reporters. */
  readonly source: TelemetrySource;

  #state: TelemetryProviderState;

  /**
   * Stream of every telemetry item tracked by this provider.
   *
   * @returns An observable emitting each tracked `TelemetryItem`.
   */
  get items(): Observable<TelemetryItem> {
    return this.#state.items;
  }

  /**
   * Returns true once initialization has started.
   *
   * @returns `true` once {@link initialize} has been called, otherwise `false`.
   */
  get initialized(): boolean {
    return this.#state.value.status !== 'idle';
  }

  /**
   * Sets the resolved framework module instances used to resolve metadata.
   *
   * @param value - The resolved framework module instances.
   */
  set modules(value: ModulesInstanceType<Modules>) {
    this.#state.modules = value;
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
    this.source = Object.freeze(config?.source ?? { hostId: crypto.randomUUID() });
    this.#state = new TelemetryProviderState({ config, event: deps?.event, owner: this });
  }

  /**
   * Connects exporters, the parent relay and startup streams. Exporter initialization failures
   * are reported but do not prevent the provider from becoming usable.
   *
   * Repeated and reentrant calls return the same promise.
   *
   * @param args - Optional parent provider to relay to, and startup records to track.
   * @returns Resolves when the provider is connected.
   * @throws {Error} When the provider has already been disposed.
   */
  public initialize(args?: TelemetryInitializeArgs): Promise<void> {
    return this.#state.initialize(args);
  }

  /** {@inheritDoc ITelemetryProvider.scope} */
  public scope(module: string, options?: OperationalTelemetryOptions): OperationalTelemetry {
    const scope = createOperationalTelemetry(module, options);
    scope.connect(this);
    return scope;
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
    return this.#state.dispose();
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
    this.#state.track(item, hasAdapters);
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
    this.#state.track(TelemetryEventSchema.parse({ ...data, type: TelemetryType.Event }));
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
    this.#state.track(TelemetryExceptionSchema.parse({ ...data, type: TelemetryType.Exception }));
  }

  /**
   * Tracks a telemetry metric.
   *
   * @param data - The metric data (without type)
   * @example
   * provider.trackMetric({ name: 'response_time', value: 123 });
   */
  public trackMetric(data: Omit<z.input<typeof TelemetryMetricSchema>, 'type'>): void {
    this.#state.track(TelemetryMetricSchema.parse({ ...data, type: TelemetryType.Metric }));
  }

  /**
   * Tracks a custom telemetry event.
   *
   * @param data - The custom event data (without type)
   * @example
   * provider.trackCustom({ name: 'custom_event', metadata: { foo: 'bar' } });
   */
  public trackCustom(data: Omit<z.input<typeof TelemetryCustomEventSchema>, 'type'>): void {
    this.#state.track(TelemetryCustomEventSchema.parse({ ...data, type: TelemetryType.Custom }));
  }

  /**
   * Retrieves a telemetry adapter by its identifier.
   *
   * @typeParam T - The key of the `TelemetryAdapter` to retrieve.
   * @param identifier - The identifier of the telemetry adapter to retrieve.
   * @returns The telemetry adapter corresponding to the given identifier, or `undefined` if not found.
   */
  public getAdapter(identifier: string): ITelemetryAdapter | undefined {
    const adapter = this.#state.adapters[identifier];
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
    return identifier in this.#state.adapters;
  }
}
