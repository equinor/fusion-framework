import {
  type IModuleConfigurator,
  type IModulesConfigurator,
  type Module,
  type ModuleConfigType,
  type ModuleInstance,
  SemanticVersion,
} from '@equinor/fusion-framework-module';
import { type INavigationConfigurator, NavigationConfigurator } from './configurator';
import { createHistory } from './createHistory';
import { type INavigationProvider, NavigationProvider } from './lib';

import { version } from './version';

/**
 * Module key identifier for the navigation module.
 */
export const moduleKey = 'navigation';

/**
 * Type definition for the navigation module.
 * Represents the module structure with its key, provider, and configurator types.
 */
export type NavigationModule = Module<
  typeof moduleKey,
  INavigationProvider,
  INavigationConfigurator
>;

/**
 * Navigation module implementation.
 * Provides routing and navigation capabilities using React Router 7.
 *
 * @remarks
 * This module:
 * - Manages browser history (browser, hash, or memory)
 * - Handles route navigation and state
 * - Provides localized paths based on basename
 * - Integrates with React Router 7 for route management
 */
export const module: NavigationModule = {
  version: new SemanticVersion(version),
  name: moduleKey,
  /**
   * Configures the navigation module.
   * If a reference navigation module exists, reuses its navigator history.
   *
   * @param ref - Optional module instance reference (for module composition)
   * @returns A new NavigationConfigurator instance
   */
  configure: (ref?: ModuleInstance) => {
    const configurator = new NavigationConfigurator();
    // Reuse history from reference if available (for module composition)
    if (ref?.navigation) {
      configurator.history = ref.navigation.navigator;
    }
    return configurator;
  },
  /**
   * Initializes the navigation module with the provided configuration.
   * Creates a default browser history if none is provided.
   *
   * @param config - Module configuration containing history and basename
   * @returns A new NavigationProvider instance
   */
  initialize: ({ config }) => {
    // Default to browser history if not provided
    config.history ??= createHistory();
    return new NavigationProvider({ version, config });
  },
  /**
   * Disposes of the navigation module instance.
   * Cleans up subscriptions and resources.
   *
   * @param instance - The NavigationProvider instance to dispose
   */
  dispose({ instance }) {
    instance.dispose();
  },
};

/**
 * Helper function to enable the navigation module with a basename or custom configuration.
 *
 * @param configurator - The modules configurator to add navigation to
 * @param basenameOrOptions - Either a basename string or full configuration options
 * @typeParam TRef - Reference type for module composition
 *
 * @example
 * ```ts
 * // Simple usage with basename
 * enableNavigation(configurator, '/app');
 *
 * // Advanced usage with full configuration
 * enableNavigation(configurator, {
 *   configure: (config) => {
 *     config.basename = '/app';
 *     config.history = createMemoryHistory();
 *   }
 * });
 * ```
 */
export const enableNavigation = <TRef = unknown>(
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  basenameOrOptions?: string | Omit<IModuleConfigurator<NavigationModule, TRef>, 'module'>,
): void => {
  // Normalize options: convert string basename to config function, or use provided options
  const options =
    typeof basenameOrOptions === 'string'
      ? {
          configure: (config: ModuleConfigType<NavigationModule>) => {
            config.basename = basenameOrOptions;
          },
        }
      : basenameOrOptions;
  configurator.addConfig({ module, ...options });
};

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    navigation: NavigationModule;
  }
}
