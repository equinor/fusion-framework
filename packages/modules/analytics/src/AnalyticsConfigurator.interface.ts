import type { ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import type { IAnalyticsCollector } from './collectors/AnalyticsCollector.interface.js';
import type { IAnalyticsAdapter } from './adapters/AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from './types.js';

/**
 * Configuration options for setting up analytics within the framework.
 *
 * @property collectors - Record of analytics collectors keyed by identifier to be used for reporting analytics data.
 * @property adapters - Record of analytics adapters keyed by identifier to be used to handle events.
 */
export type AnalyticsConfig = {
  collectors: Record<string, IAnalyticsCollector>;
  adapters: Record<string, IAnalyticsAdapter>;
};

/**
 * Interface for configuring analytics within the module.
 *
 * Provides methods to set analytics adapters and collectors.
 *
 * @interface IAnalyticsConfigurator
 */
export interface IAnalyticsConfigurator {
  /**
   * Sets a analytics collector with the given identifier and configuration callback.
   *
   * @param identifier - The unique identifier for the collector.
   * @param callBack - Configuration callback that returns the collector instance.
   * @returns The configurator instance for method chaining.
   */
  setCollector<T extends AnalyticsEvent>(
    identifier: string,
    callBack: ConfigBuilderCallback<IAnalyticsCollector<T>>,
  ): this;

  /**
   * Sets a analytics adapter with the given identifier and configuration callback.
   *
   * @param identifier - The unique identifier for the adapter.
   * @param callBack - Configuration callback that returns the adapter instance.
   * @returns The configurator instance for method chaining.
   */
  setAdapter<T extends AnalyticsEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IAnalyticsAdapter<T>>,
  ): this;
}
