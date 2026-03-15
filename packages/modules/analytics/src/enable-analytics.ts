import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module.js';
import type { IAnalyticsConfigurator } from './AnalyticsConfigurator.interface.js';

/** Callback invoked with the {@link IAnalyticsConfigurator} to register adapters and collectors. */
type AnalyticsBuilderCallback = (builder: IAnalyticsConfigurator) => void | Promise<void>;

/**
 * Enables the analytics module on a Fusion Framework module configurator.
 *
 * Call this helper during application or portal configuration to register
 * adapters and collectors for analytics tracking.
 *
 * @param configurator - The module configurator instance to attach analytics to.
 * @param callback - Optional callback to register adapters and collectors on the analytics builder.
 *
 * @example
 * ```ts
 * import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
 * import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
 *
 * const configure = (configurator) => {
 *   enableAnalytics(configurator, (builder) => {
 *     builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());
 *   });
 * };
 * ```
 */
export const enableAnalytics = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  callback?: AnalyticsBuilderCallback,
): void => {
  configurator.addConfig({
    module,
    configure: async (builder) => {
      if (callback) {
        await Promise.resolve(callback(builder));
      }
    },
  });
};
