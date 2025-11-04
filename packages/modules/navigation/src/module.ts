import {
  type IModulesConfigurator,
  type Module,
  type ModuleConfigType,
  type ModuleInstance,
  SemanticVersion,
} from '@equinor/fusion-framework-module';
import { NavigationConfigurator } from './configurator';
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
  NavigationConfigurator
>;

/**
 * Navigation module implementation.
 * Provides routing and navigation capabilities using React Router 7.
 *
 * @remarks
 * - Uses BaseConfigBuilder pattern with Zod validation
 * - Basename must match the URL path prefix where your app is served
 * - React Router 7 requires URL pathname to start with the basename
 */
export const module: NavigationModule = {
  version: new SemanticVersion(version),
  name: moduleKey,
  /**
   * Configures the navigation module.
   * Optionally reuses history from a reference module for composition.
   *
   * @param ref - Optional module instance reference
   * @returns A new NavigationConfigurator instance
   */
  configure: (ref?: ModuleInstance) => {
    const configurator = new NavigationConfigurator();
    // Reuse history from reference if available (for module composition)
    // Use setHistory method to configure via BaseConfigBuilder pattern
    // INavigator extends History, so it's compatible
    if (ref?.navigation) {
      // Navigator extends History, so we can use it directly as History
      // Return the navigator as History (Navigator extends History interface)
      // Wrap in of() to satisfy ObservableInput type requirement
      // Explicitly cast to History from @remix-run/router to avoid type conflict
      configurator.setHistory(ref.navigation.navigator);
    }
    return configurator;
  },
  /**
   * Initializes the navigation module with validated configuration.
   *
   * @param init - Module initialization arguments
   * @returns A Promise that resolves to a new NavigationProvider instance
   */
  initialize: async (init) => {
    // Create and validate configuration using BaseConfigBuilder pattern
    const config = await init.config.createConfigAsync(init);
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
 * Helper function to enable the navigation module.
 *
 * @param configurator - The modules configurator to add navigation to
 * @param basenameOrOptions - Basename string or configuration object with `configure` callback
 * @typeParam TRef - Reference type for module composition
 *
 * @remarks
 * Basename must match the URL path prefix where your app is served.
 * React Router 7 requires the URL pathname to start with the basename.
 *
 * @example
 * ```ts
 * // Simple usage
 * enableNavigation(configurator, '/apps/my-app');
 *
 * // Advanced usage
 * enableNavigation(configurator, {
 *   configure: (config) => {
 *     config.setBasename('/apps/my-app');
 *     config.setHistory(createMemoryHistory());
 *   }
 * });
 * ```
 */
export const enableNavigation = <TRef = unknown>(
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  basenameOrOptions?:
    | string
    | {
        configure: (config: ModuleConfigType<NavigationModule>, ref: TRef) => void;
      },
): void => {
  configurator.addConfig({
    module,
    configure(config, ref) {
      if (typeof basenameOrOptions === 'string') {
        config.setBasename(basenameOrOptions);
      } else if (typeof basenameOrOptions === 'object' && 'configure' in basenameOrOptions) {
        basenameOrOptions.configure(config, ref);
      }
    },
  });
};

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    navigation: NavigationModule;
  }
}
