/**
 * @packageDocumentation
 *
 * Framework module for loading, configuring, and managing Fusion applications at runtime.
 *
 * Use {@link enableAppModule} to register the module with a framework configurator.
 * Once initialized, {@link AppModuleProvider} exposes methods for fetching app manifests,
 * configurations, user settings, and for setting the current active application.
 *
 * @example
 * ```ts
 * import { enableAppModule } from '@equinor/fusion-framework-module-app';
 *
 * export const configure = async (configurator: FrameworkConfigurator) => {
 *   enableAppModule(configurator);
 * };
 * ```
 */

export {
  AppModuleConfig,
  AppConfigurator,
  IAppConfigurator,
  type AppModuleConfig as IAppModuleConfig,
} from './AppConfigurator.js';

export { AppClient, type IAppClient } from './AppClient.js';

export { AppConfig } from './AppConfig.js';

export { AppModuleProvider } from './AppModuleProvider.js';

export { IApp } from './app/App.js';

export * from './events.js';
export * from './types.js';

export { enableAppModule } from './enable-app-module.js';

export { default, AppModule, module, moduleKey } from './module.js';
