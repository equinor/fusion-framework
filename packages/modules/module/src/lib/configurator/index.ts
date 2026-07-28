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
export {
  ModuleConfiguratorEventBaseName,
  ModuleConfiguratorEventName,
} from './module-configurator-event-name.js';
export type { ModuleConfiguratorEventName as ModuleConfiguratorEventNameType } from './module-configurator-event-name.js';

export { ModulesConfigurator } from './ModulesConfigurator.js';

// Phase functions are exported for testing and advanced subclass use cases.
// Direct consumers should use ModulesConfigurator instead.
export { createModuleConfigs } from './phases/create-module-configs.js';
export { runPostConfigureHooks } from './phases/run-post-configure-hooks.js';
export { runConfigurePhase } from './phases/run-configure-phase.js';
export { createRequireInstance } from './phases/create-require-instance.js';
export { runInitializePhase } from './phases/run-initialize-phase.js';
export { runPostInitializePhase } from './phases/run-post-initialize-phase.js';
export { runPluginPhase } from './phases/run-plugin-phase.js';
export { runDisposePhase } from './phases/run-dispose-phase.js';
