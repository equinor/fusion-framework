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
} from './AppConfigurator';

export { AppClient, type IAppClient } from './AppClient';

export { AppModuleProvider } from './AppModuleProvider';

export { IApp } from './app/App';

export * from './events';
export * from './types';

export { enableAppModule } from './enable-app-module';

export { default, AppModule, module, moduleKey } from './module';
