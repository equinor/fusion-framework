import type { Module } from '@equinor/fusion-framework-module';
import type { ModuleDeps } from './types';

import { WidgetModuleConfigurator } from './WidgetModuleConfigurator';
import { type IWidgetModuleProvider, WidgetModuleProvider } from './WidgetModuleProvider';

/** Module registration key used in the Fusion Framework module map. */
export const moduleKey = 'widget';

/**
 * Module type definition binding the `'widget'` key to the
 * {@link IWidgetModuleProvider} instance, {@link WidgetModuleConfigurator}
 * configuration builder, and required {@link ModuleDeps}.
 */
export type WidgetModule = Module<
  typeof moduleKey,
  IWidgetModuleProvider,
  WidgetModuleConfigurator,
  ModuleDeps
>;

/**
 * Widget module descriptor.
 *
 * Defines how the widget module is configured, initialized, and disposed
 * within the Fusion Framework module system.
 *
 * - `configure` — creates a fresh {@link WidgetModuleConfigurator}
 * - `initialize` — resolves the config, optionally acquires the event module,
 *   and returns a {@link WidgetModuleProvider}
 * - `dispose` — cleans up provider subscriptions
 */
export const module: WidgetModule = {
  name: moduleKey,
  configure() {
    const config = new WidgetModuleConfigurator();
    return config;
  },
  initialize: async (args) => {
    const config = await args.config.createConfigAsync(args);
    const event = await args.requireInstance('event').catch(() => undefined);
    return new WidgetModuleProvider({ config, event });
  },
  dispose: (args) => {
    (args.instance as unknown as WidgetModuleProvider).dispose();
  },
};

export default module;

/**
 * Augments the global Fusion Framework `Modules` interface so that
 * `modules.widget` is typed as {@link WidgetModule}.
 */
declare module '@equinor/fusion-framework-module' {
  interface Modules {
    [moduleKey]: WidgetModule;
  }
}
