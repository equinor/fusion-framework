import type { ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import type { IAnalyticsCollector } from './collectors/AnalyticsCollector.interface.js';
import type { IAnalyticsAdapter } from './adapters/AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from './types.js';

/**
 * Resolved analytics configuration containing the instantiated collectors and adapters.
 *
 * @remarks
 * This type is the output of the configuration stage. The module’s `initialize`
 * function receives the resolved `AnalyticsConfig` and passes it to
 * {@link AnalyticsProvider}.
 */
export type AnalyticsConfig = {
  /** Record of analytics collectors keyed by a unique identifier. */
  collectors: Record<string, IAnalyticsCollector>;
  /** Record of analytics adapters keyed by a unique identifier. */
  adapters: Record<string, IAnalyticsAdapter>;
};

/**
 * Configuration-time interface for registering analytics adapters and collectors.
 *
 * @remarks
 * Obtain an instance of this interface inside the callback passed to
 * {@link enableAnalytics}. Use {@link IAnalyticsConfigurator.setAdapter | setAdapter}
 * and {@link IAnalyticsConfigurator.setCollector | setCollector} to register
 * components. Both methods support method chaining.
 *
 * @example
 * ```ts
 * enableAnalytics(configurator, (builder) => {
 *   builder
 *     .setAdapter('console', async () => new ConsoleAnalyticsAdapter())
 *     .setCollector('context-selected', async (args) => {
 *       const ctx = await args.requireInstance('context');
 *       const app = await args.requireInstance('app');
 *       return new ContextSelectedCollector(ctx, app);
 *     });
 * });
 * ```
 */
export interface IAnalyticsConfigurator {
  /**
   * Registers an analytics collector factory identified by a unique key.
   *
   * The factory callback receives module-resolution arguments so it can
   * resolve dependencies (e.g. context or app providers) before returning
   * the collector instance.
   *
   * @template T - The concrete analytics event type the collector emits.
   * @param identifier - Unique key for this collector.
   * @param callBack - Async factory that returns the collector instance.
   * @returns The configurator instance for method chaining.
   */
  setCollector<T extends AnalyticsEvent>(
    identifier: string,
    callBack: ConfigBuilderCallback<IAnalyticsCollector<T>>,
  ): this;

  /**
   * Registers an analytics adapter factory identified by a unique key.
   *
   * The factory callback receives module-resolution arguments so it can
   * resolve dependencies (e.g. service-discovery HTTP clients) before
   * returning the adapter instance.
   *
   * @template T - The concrete analytics event type the adapter handles.
   * @param identifier - Unique key for this adapter.
   * @param callback - Async factory that returns the adapter instance.
   * @returns The configurator instance for method chaining.
   */
  setAdapter<T extends AnalyticsEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IAnalyticsAdapter<T>>,
  ): this;
}
