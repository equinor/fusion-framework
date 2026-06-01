import type { AnyModule, ModuleConfigType, ModulesConfig } from '../../types.js';

export type { IModulesConfigurator } from './IModulesConfigurator.js';
export type { IModuleConfigurator } from './IModuleConfigurator.js';

/**
 * Callback type for configuring a single module's config builder.
 *
 * @template TModule - The module type being configured.
 * @template TRef - An optional reference type available during configuration.
 *
 * @param config - The configuration builder for the specified module.
 * @param ref - An optional reference object (e.g. a parent framework instance).
 * @returns `void` or a `Promise<void>` for async configuration.
 */
export type ModuleConfiguratorConfigCallback<TModule extends AnyModule, TRef = unknown> = (
  config: ModuleConfigType<TModule>,
  ref?: TRef,
) => void | Promise<void>;

/**
 * Callback type for a top-level configurator that receives the merged module
 * config map.
 *
 * @template TRef - The reference type passed during initialization.
 *
 * @param config - The merged module config map for all registered modules.
 * @param ref - An optional reference forwarded from the caller.
 * @returns `void` or a `Promise<void>` for async configuration.
 */
export type ModulesConfiguratorConfigCallback<TRef> = (
  config: ModulesConfig<[AnyModule]>,
  ref?: TRef,
) => void | Promise<void>;

/**
 * Error thrown when a required module fails to initialize within the expected
 * timeout window.
 *
 * Indicates a circular dependency or a module that never resolves.
 */
export class RequiredModuleTimeoutError extends Error {
  constructor() {
    super('Module initialization timed out');
    this.name = 'RequiredModuleTimeoutError';
  }
}
