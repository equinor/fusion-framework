import { from } from 'rxjs';
import { concatMap, last, scan } from 'rxjs/operators';

import { BaseConfigBuilder } from '@equinor/fusion-framework-module';

import type { TelemetryAdapter } from './types.js';
import type { ITelemetryConfigurator, TelemetryConfig } from './TelemetryConfigurator.interface.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { toObservable } from '@equinor/fusion-observable';
import { mergeMetadata } from './utils/merge-telemetry-item.js';

/**
 * Configures telemetry settings for the application.
 *
 * The `TelemetryConfigurator` class extends `BaseConfigBuilder` to provide a fluent API for
 * setting up telemetry adapters, metadata, default scopes, parent providers, and filters.
 *
 * @example
 * ```typescript
 * const configurator = new TelemetryConfigurator()
 *   .setAdapter(myAdapter)
 *   .setMetadata({ app: 'my-app' })
 *   .setDefaultScope(['user', 'session'])
 *   .setParent(parentProvider)
 *   .setFilter(myFilter);
 * ```
 *
 * @remarks
 * - Adapters are managed internally and can be set using `setAdapter`.
 * - Metadata, default scope, parent provider, and filter can be configured via their respective methods.
 * - All setter methods return `this` for method chaining.
 *
 * @see BaseConfigBuilder
 * @see ITelemetryConfigurator
 */
export class TelemetryConfigurator
  extends BaseConfigBuilder<TelemetryConfig>
  implements ITelemetryConfigurator
{
  #adapters: Record<string, TelemetryAdapter> = {};
  #metadata: Array<TelemetryConfig['metadata']> = [];

  constructor() {
    super();
    this._set('adapters', async () => Object.values(this.#adapters));
    this._set('metadata', async (): Promise<TelemetryConfig['metadata']> => {
      const metadataItems = this.#metadata;
      return (...args) =>
        from(metadataItems).pipe(
          concatMap((metadata) => toObservable(metadata, ...args)),
          scan((acc, current) => mergeMetadata(acc, current) ?? {}, {}),
          last(),
        );
    });
  }

  /**
   * Registers a telemetry adapter with the configurator.
   *
   * @param adapter - The telemetry adapter to be added. The adapter's identifier is used as the key.
   * @returns The current instance of the configurator for method chaining.
   */
  public setAdapter(adapter: TelemetryAdapter): this {
    this.#adapters[String(adapter.identifier)] = adapter;
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
  public setDefaultScope(scope: string[]): this {
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

  public attachItems(item$: TelemetryConfig['items$']): this {
    this._set('items$', item$);
    return this;
  }
}
