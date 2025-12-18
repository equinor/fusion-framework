import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module.js';
import type { IAnalyticsConfigurator } from './AnalyticsConfigurator.interface.js';

type AnalyticsBuilderCallback = (builder: IAnalyticsConfigurator) => void | Promise<void>;

/**
 * Enables analytics for agiven module configurator.
 *
 * @param configurator - The module configurator instance to which analytics should be attached.
 * @param callback - An optional callback to further configure the analytics builder. Can be synchronous or asynchronous.
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
