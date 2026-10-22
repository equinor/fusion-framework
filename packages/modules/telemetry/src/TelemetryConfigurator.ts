import { EMPTY, defer, from, type ObservableInput } from 'rxjs';
import {
  concatMap,
  catchError,
  defaultIfEmpty,
  filter,
  last,
  map,
  mergeMap,
  scan,
  shareReplay,
} from 'rxjs/operators';

import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';

import type { ITelemetryConfigurator, TelemetryConfig } from './TelemetryConfigurator.interface.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { toObservable } from '@equinor/fusion-observable';
import { mergeMetadata } from './utils/merge-telemetry-item.js';
import type { ITelemetryAdapter } from './TelemetryAdapter.js';
import type { TelemetrySource } from './schemas/diagnostic-context.js';
import { operationalIdentifier } from './schemas/operational-identifier.js';

/** A declared exporter: how to create it, and whether it owns delivery. */
interface DeclaredAdapter {
  configure: ConfigBuilderCallback<ITelemetryAdapter>;
  /** Explicit (non-fallback) exporters own delivery, suppressing the parent's fallback exporters. */
  explicit: boolean;
}

/**
 * Configures telemetry settings for the application.
 *
 * The `TelemetryConfigurator` class extends `BaseConfigBuilder` to provide a fluent API for
 * setting up telemetry adapters, metadata, default scopes, parent providers, host identity and
 * lifecycle records. Every setter records configuration; nothing is resolved until the
 * telemetry module builds its configuration.
 *
 * @example
 * ```typescript
 * const configurator = new TelemetryConfigurator()
 *   .setAdapter('console', consoleAdapter)
 *   .setMetadata({ app: 'my-app' })
 *   .setDefaultScope(['user', 'session'])
 *   .setParent(parentProvider);
 * ```
 *
 * @remarks
 * - Adapters are managed internally and can be set using `setAdapter`.
 * - Metadata, default scope, and parent provider can be configured via their respective methods.
 * - Filters should be applied directly to individual adapters when they are created.
 * - All setter methods return `this` for method chaining.
 *
 * @see BaseConfigBuilder
 * @see ITelemetryConfigurator
 */
export class TelemetryConfigurator
  extends BaseConfigBuilder<TelemetryConfig>
  implements ITelemetryConfigurator
{
  #adapters: Record<string, DeclaredAdapter> = {};
  #metadata: Array<TelemetryConfig['metadata']> = [];

  /**
   * Creates a new `TelemetryConfigurator` and wires up the async adapter
   * resolution and metadata merging pipelines used by `createConfigAsync`.
   */
  constructor() {
    super();

    // Configure async adapter resolution using mergeMap to handle Promise/Observable adapter factories
    this._set(
      'adapters',
      (args: ConfigBuilderCallbackArgs): ObservableInput<Record<string, ITelemetryAdapter>> => {
        // Resolve every adapter factory concurrently and merge them into a single record
        return from(Object.entries(this.#adapters)).pipe(
          mergeMap(([identifier, { configure }]) =>
            // Drop adapters whose factory resolved to a falsy value
            defer(() => from(configure(args))).pipe(
              filter((adapter): adapter is ITelemetryAdapter => !!adapter),
              map((adapter) => [identifier, adapter] as const),
              catchError(() => {
                // Factory errors may carry credentials or URLs, so only the failure is reported.
                console.warn('Telemetry adapter factory failed');
                return EMPTY;
              }),
            ),
          ),
          scan(
            (acc, [identifier, adapter]) => {
              acc[identifier] = adapter;
              return acc;
            },
            {} as Record<string, ITelemetryAdapter>,
          ),
          defaultIfEmpty({}),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
      },
    );

    // Ownership is declared configuration: a failed explicit exporter still owns delivery,
    // so its failure can never activate an ancestor's fallback exporter.
    this._set('ownsExport', async () =>
      // Any explicit declaration owns delivery.
      Object.values(this.#adapters).some(({ explicit }) => explicit),
    );

    // Configure metadata merging - handles multiple sync/async metadata sources
    this._set('metadata', async (): Promise<TelemetryConfig['metadata']> => {
      const metadataItems = this.#metadata;
      return (...args) =>
        // Merge every registered metadata source in order, emitting the final accumulated result
        from(metadataItems).pipe(
          concatMap((metadata) => toObservable(metadata, ...args)),
          scan((acc, current) => mergeMetadata(acc, current) ?? {}, {}),
          defaultIfEmpty({}),
          last(),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
    });
  }

  /**
   * Registers a telemetry adapter with the configurator.
   *
   * A non-fallback adapter is an explicit exporter: it owns delivery, so the parent's fallback
   * exporters skip records this provider relays.
   *
   * @param identifier - The key used to register and later resolve this adapter.
   * @param adapter - The telemetry adapter to be added.
   * @returns The current instance of the configurator for method chaining.
   */
  public setAdapter(identifier: string, adapter: ITelemetryAdapter): this {
    this.#adapters[identifier] = { configure: async () => adapter, explicit: !adapter.fallback };
    return this;
  }

  /**
   * Configures a telemetry adapter with the configurator.
   *
   * A factory's adapter is unknown until it resolves, so it is declared as an explicit exporter;
   * register fallback adapters with `setAdapter`.
   *
   * @param identifier - The key used to register and later resolve this adapter.
   * @param adapterFn - A callback function that returns a telemetry adapter instance
   * @returns The current instance for method chaining
   */
  public configureAdapter(
    identifier: string,
    adapterFn: ConfigBuilderCallback<ITelemetryAdapter>,
  ): this {
    this.#adapters[identifier] = { configure: adapterFn, explicit: true };
    return this;
  }

  /**
   * Sets the metadata configuration for telemetry.
   *
   * @remarks
   * All setting will accumulate, and the metadata will be merged.
   *
   * @param metadata - The metadata object or a callback function that receives and returns the metadata configuration.
   * @returns The current instance for method chaining.
   */
  public setMetadata(metadata: TelemetryConfig['metadata']): this {
    this.#metadata.push(metadata);
    return this;
  }

  /**
   * Sets the default scope for telemetry operations.
   *
   * @param scope - An array of strings representing the default scope to be used.
   * @returns The current instance for method chaining.
   */
  public setDefaultScope(scope: string[] | ConfigBuilderCallback<string[]>): this {
    this._set('defaultScope', scope);
    return this;
  }

  /**
   * Sets the parent telemetry provider for this configurator.
   *
   * @param parent - The parent telemetry provider to associate, or `undefined` to remove the parent.
   * @returns The current instance for method chaining.
   */
  public setParent(parent: ITelemetryProvider | undefined): this {
    this._set('parent', parent);
    return this;
  }

  /** @inheritdoc */
  public setSource(source: TelemetrySource): this {
    // Fail at configuration time; an invalid label would otherwise drop every built-in record.
    if (source.source !== undefined && !operationalIdentifier.safeParse(source.source).success) {
      throw new RangeError(
        'Telemetry source kind must be a lowercase kebab-case identifier, such as "portal"',
      );
    }
    this._set('source', Object.freeze({ ...source }));
    return this;
  }

  /**
   * Attaches an observable stream of telemetry items to the configurator.
   *
   * @param item$ - An observable input stream of telemetry items to be processed.
   * @returns The current instance for method chaining.
   */
  public attachItems(item$: TelemetryConfig['items$']): this {
    this._set('items$', item$);
    return this;
  }

  /** @inheritdoc */
  public attachLifecycleItems(item$: NonNullable<TelemetryConfig['lifecycleItems$']>): this {
    this._set('lifecycleItems$', item$);
    return this;
  }

  /** @inheritdoc */
  public hasLifecycleItems(): boolean {
    return this._has('lifecycleItems$');
  }

  /** @inheritdoc */
  public setLifecycleItemsEnabled(enabled: boolean): this {
    this._set('lifecycleItemsEnabled', enabled);
    return this;
  }

  /**
   * Sets the filter configuration for telemetry items.
   *
   * The filter determines which telemetry items should be passed to adapters and/or relayed to parent providers.
   *
   * @param filter - Either a filter object with `adapter` and `relay` functions, or a callback that returns such a filter object.
   * @returns The current instance for method chaining.
   */
  public setFilter(
    filter: ConfigBuilderCallback<TelemetryConfig['filter']> | TelemetryConfig['filter'],
  ): this {
    this._set('filter', filter);
    return this;
  }
}
