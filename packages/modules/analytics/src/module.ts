import type { Module } from '@equinor/fusion-framework-module';
import type { IAnalyticsConfigurator } from './AnalyticsConfigurator.interface.js';
import type { IAnalyticsProvider } from './AnalyticsProvider.interface.js';
import { AnalyticsConfigurator } from './AnalyticsConfigurator.js';
import { AnalyticsProvider } from './AnalyticsProvider.js';

/**
 * Represents the Analytics module type within the Fusion Framework module system.
 *
 * @remarks
 * This type defines a module named `analytics` that integrates with the framework's
 * module system. It specifies the provider and configurator interfaces for analytics
 * functionality, and declares a self-dependency so that child modules can inherit
 * analytics from a parent scope.
 *
 * @see {@link IAnalyticsProvider} for the runtime provider interface.
 * @see {@link IAnalyticsConfigurator} for configuration-time setup.
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
 * This module provides analytics capabilities by configuring and initializing an
 * {@link AnalyticsProvider}. Register it with {@link enableAnalytics} or add it
 * directly to a module configurator.
 *
 * - `name` — `'analytics'`
 * - `configure()` — creates a new {@link AnalyticsConfigurator} instance.
 * - `initialize(args)` — resolves the configuration, creates an
 *   {@link AnalyticsProvider}, calls {@link AnalyticsProvider.initialize},
 *   and returns the ready-to-use provider.
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
