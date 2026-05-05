/**
 * Core module system for the Fusion Framework.
 *
 * Defines the base types, interfaces, and utilities for creating and
 * initializing framework modules. All Fusion modules implement the
 * {@link Module} interface and are wired together via
 * {@link initializeModules}.
 *
 * @see {@link ModuleConfigBuilder} for building module configuration.
 * @see {@link SemanticVersion} for version utilities.
 *
 * @packageDocumentation
 */
export type {
  AnyModule,
  AnyModuleInstance,
  CombinedModules,
  IModulesConfig,
  Module,
  ModuleConfigType,
  ModuleEvent,
  ModuleEventLevel,
  ModuleInitializerArgs,
  ModuleInstance,
  ModuleKey,
  ModuleType,
  ModuleTypes,
  Modules,
  ModulesConfig,
  ModulesConfigType,
  ModulesInstance,
  ModulesInstanceType,
  ModulesObjectConfigType,
  ModulesObjectInstanceType,
  ModulesType,
} from './types.js';

export { SemanticVersion } from './lib/semantic-version.js';

export type { IModuleProvider } from './lib/provider/IModuleProvider.js';

export type { DotPath, DotPathType, DotPathUnion } from './utils/dot-path.js';

export { initializeModules } from './initialize-modules.js';

export { ModuleConsoleLogger, IModuleConsoleLogger } from './logger.js';

export { ModuleConfigBuilder } from './ModuleConfigBuilder.js';
export {
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
  BaseConfigBuilder,
} from './BaseConfigBuilder.js';

export {
  type ModulesConfiguratorConfigCallback,
  type ModuleConfiguratorConfigCallback,
  type IModuleConfigurator,
  type IModulesConfigurator,
  ModulesConfigurator,
} from './configurator.js';
