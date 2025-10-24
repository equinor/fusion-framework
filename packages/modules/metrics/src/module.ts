import type { Module } from '@equinor/fusion-framework-module';
import type { IMetricsConfigurator } from './MetricsConfigurator.interface.js';
import type { IMetricsProvider } from './MetricsProvider.interface.js';
import { MetricsConfigurator } from './MetricsConfigurator.js';
import { MetricsProvider } from './MetricsProvider.js';

/**
 * Representes the Metrics module within the framework.
 *
 * @remarks
 * This type defines a module names `metrics` that integrates with the framwork's module system.
 * It specifies the provider and configurator interfaces for metrics functionality, and declares
 * its dependencies on itself (`MetricsModule`).
 *
 * @typeParam IMetricsProvider - The interface for the metrics provider implementation.
 * @typeParam IMetricsConfigurator - The interface for configuring metrics behavior.
 * @typeParam MetricsModule - Self-reference to allow for recursive or hierarchical module composition.
 */
export type MetricsModule = Module<
  'metrics',
  IMetricsProvider,
  IMetricsConfigurator,
  [MetricsModule]
>;

export const module = {
  name: 'metrics',
  configure: () => new MetricsConfigurator(),
  initialize: async (args): Promise<IMetricsProvider> => {
    const config = await (args.config as MetricsConfigurator).createConfigAsync(args);

    const provider = new MetricsProvider(config);
    await provider.initialize();

    return provider;
  },
} satisfies MetricsModule;

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    metrics: MetricsModule;
  }
}
