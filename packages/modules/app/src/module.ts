import type { Module } from '@equinor/fusion-framework-module';
import type { ModuleDeps } from './types';

import { AppConfigurator } from './AppConfigurator';
import { AppModuleProvider } from './AppModuleProvider';

export const moduleKey = 'app';

export type AppModule = Module<typeof moduleKey, AppModuleProvider, AppConfigurator, ModuleDeps>;

/**
 * Represents a module for handling applications.
 * Responsible for loading applications, configurations and manifests.
 * @public
 */
export const module: AppModule = {
  /**
   * The name of the module.
   */
  name: moduleKey,
  /**
   * Configures the module.
   * @returns An instance of AppConfigurator.
   */
  configure: () => new AppConfigurator(),
  /**
   * Initializes the module.
   * @param args - The initialization arguments.
   * @returns A new instance of AppModuleProvider.
   */
  initialize: async (args) => {
    const config = await args.config.createConfigAsync(args);
    const event = await args.requireInstance('event').catch(() => undefined);
    return new AppModuleProvider({ config, event });
  },
  /**
   * Disposes the module.
   * @param args - The disposal arguments.
   */
  dispose: (args) => {
    (args.instance as unknown as AppModuleProvider).dispose();
  },
};

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    app: AppModule;
  }
}
