/**
 * Module configurator — public API re-exports.
 *
 * Consumers should import from `@equinor/fusion-framework-module` or the
 * `@equinor/fusion-framework-module/configurator` secondary entrypoint rather
 * than from this internal directory directly.
 *
 * @packageDocumentation
 */
export type { IModulesConfigurator } from './IModulesConfigurator.js';
export type { IModuleConfigurator } from './IModuleConfigurator.js';
export type {
  ModuleConfiguratorConfigCallback,
  ModulesConfiguratorConfigCallback,
} from './types.js';
export type {
  FrameworkPluginArgs,
  FrameworkPluginTeardown,
  FrameworkPluginCallback,
  FrameworkPlugin,
  FrameworkPluginInitializer,
  FrameworkPluginRegistration,
} from '../plugin/index.js';
export { createPlugin } from '../plugin/index.js';

export { RequiredModuleTimeoutError } from './types.js';
export { ModuleConfiguratorEventBaseName, ModuleConfiguratorEventName } from './events.js';
export type { ModuleConfiguratorEventName as ModuleConfiguratorEventNameType } from './events.js';

export { ModulesConfigurator } from './ModulesConfigurator.js';

// Phase functions are exported for testing and advanced subclass use cases.
// Direct consumers should use ModulesConfigurator instead.
export {
  runConfigurePhase,
  createModuleConfigs,
  runPostConfigureHooks,
} from './phases/configure.js';
export { runInitializePhase, createRequireInstance } from './phases/initialize.js';
export { runPostInitializePhase } from './phases/post-initialize.js';
export { runPluginPhase } from './phases/plugin.js';
export { runDisposePhase } from './phases/dispose.js';
