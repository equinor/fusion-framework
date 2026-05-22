/**
 * Framework plugin API for module configurators.
 *
 * Use these types with {@link IModulesConfigurator.registerPlugin} when adding
 * application-level side effects that run after modules initialize.
 *
 * @packageDocumentation
 */
export type {
  FrameworkPluginArgs,
  FrameworkPluginCallback,
  FrameworkPlugin,
  FrameworkPluginInitializer,
  FrameworkPluginRegistration,
  FrameworkPluginTeardown,
} from './types.js';
export { createPlugin } from './create-plugin.js';
