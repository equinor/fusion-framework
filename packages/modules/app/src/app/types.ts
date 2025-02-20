import { ActionBaseType } from '@equinor/fusion-observable';
import type {
  AppManifest,
  AppConfig,
  AppModulesInstance,
  AppScriptModule,
  ConfigEnvironment,
  AppSettings,
} from '../types';
import { Actions } from './actions';

/**
 * Represents the state of an application bundle.
 *
 * @template TConfig - The type of the configuration environment, defaults to `ConfigEnvironment`.
 * @template TModules - The type of the modules, defaults to `any`.
 *
 * @property {string} appKey - A unique key identifying the application.
 * @property {Set<string>} status - A set of strings representing the status of the application.
 * @property {AppManifest} [manifest] - An optional manifest describing the application.
 * @property {AppConfig<TConfig>} [config] - An optional configuration object for the application.
 * @property {AppSettings} [settings] - An optional application settings object.
 * @property {AppScriptModule} [modules] - An optional script module for the application.
 * @property {AppModulesInstance<TModules>} [instance] - An optional instance of the application modules.
 */
export type AppBundleState<
  TConfig extends ConfigEnvironment = ConfigEnvironment,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TModules = any,
> = {
  appKey: string;
  status: Set<ActionBaseType<Actions>>;
  manifest?: AppManifest;
  config?: AppConfig<TConfig>;
  settings?: AppSettings;
  modules?: AppScriptModule;
  instance?: AppModulesInstance<TModules>;
};

/**
 * Represents the initial state of an application bundle, excluding the 'status' property.
 *
 * @template TConfig - The configuration environment type, defaults to `ConfigEnvironment`.
 * @template TModules - The type of modules included in the application bundle, defaults to `any`.
 */
export type AppBundleStateInitial<
  TConfig extends ConfigEnvironment = ConfigEnvironment,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TModules = any,
> = Omit<AppBundleState<TConfig, TModules>, 'status'>;
