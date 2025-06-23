export * from './types';
export * from './lib';

export type { DotPath, DotPathType, DotPathUnion } from './utils/dot-path.js';

export { initializeModules } from './initialize-modules';

export { ModuleConsoleLogger, IModuleConsoleLogger } from './logger';

export { ModuleConfigBuilder } from './ModuleConfigBuilder';
export {
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
  BaseConfigBuilder,
} from './BaseConfigBuilder';

export {
  type ModulesConfiguratorConfigCallback,
  type ModuleConfiguratorConfigCallback,
  type IModuleConfigurator,
  type IModulesConfigurator,
  ModulesConfigurator,
} from './configurator';
