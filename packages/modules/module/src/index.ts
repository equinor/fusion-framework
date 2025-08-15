export type {
  AnyModule,
  AnyModuleInstance,
  CombinedModules,
  IModulesConfig,
  Module,
  ModuleConfigType,
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
