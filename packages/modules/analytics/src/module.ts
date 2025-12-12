import type { Module } from '@equinor/fusion-framework-module';
import type { IAnalyticsConfigurator } from './AnalyticsConfigurator.interface.js';
import type { IAnalyticsProvider } from './AnalyticsProvider.interface.js';
import { AnalyticsConfigurator } from './AnalyticsConfigurator.js';
import { AnalyticsProvider } from './AnalyticsProvider.js';

/**
 * Representes the Analytics module within the framework.
 *
 * @remarks
 * This type defines a module names `analytics` that integrates with the framwork's module system.
 * It specifies the provider and configurator interfaces for analytics functionality, and declares
 * its dependencies on itself (`AnalyticsModule`).
 *
 * @typeParam IAnalyticsProvider - The interface for the analytics provider implementation.
 * @typeParam IAnalyticsConfigurator - The interface for configuring analytics behavior.
 * @typeParam AnalyticsModule - Self-reference to allow for recursive or hierarchical module composition.
 */
export type AnalyticsModule = Module<
  'analytics',
  IAnalyticsProvider,
  IAnalyticsConfigurator,
  [AnalyticsModule]
>;

/**
 * Analytics module definition for the Fusion Framework.
 *
 * @remarks
 * This module provides analytics capabilities by configuring and initializing a analytics provider.
 *
 * @type {AnalyticsModule}
 *
 * @property {string} name - The name of the module ('analytics').
 * @property {() => AnalyticsConfigurator} configure - Factory function to create a new AnalyticsConfigurator instance.
 * @property {(args) => Promise<IAnalyticsProvider>} initialize - Asynchronous initializer that creates and returns a AnalyticsProvider.
 *   - @param args - Initialization arguments, including configuration and module dependencies.
 *   - @returns A promise that resolves to an instance of IAnalyticsProvider.
 */
export const module = {
  name: 'analytics',
  configure: () => new AnalyticsConfigurator(),
  initialize: async (args): Promise<IAnalyticsProvider> => {
    const config = await (args.config as AnalyticsConfigurator).createConfigAsync(args);

    const provider = new AnalyticsProvider(config);
    await provider.initialize();

    return provider;
  },
} satisfies AnalyticsModule;

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    analytics: AnalyticsModule;
  }
}
