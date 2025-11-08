import {
  type Module,
  SemanticVersion,
} from '@equinor/fusion-framework-module';
import { NavigationConfigurator } from './NavigationConfigurator';
import type { INavigationProvider } from './NavigationProvider.interface';
import { NavigationProvider } from './NavigationProvider';

import { version } from './version';

/**
 * Module key identifier for the navigation module.
 */
export const moduleKey = 'navigation';

/**
 * Type definition for the navigation module.
 * 
 * This is the main type definition for the navigation module. It represents the complete
 * module structure with its key identifier, provider interface, and configurator class.
 * 
 * The navigation module provides routing and navigation capabilities compatible with
 * industry-standard routers (Remix/React Router), with support for browser history,
 * hash routing, and memory history. It integrates with the Fusion Framework module
 * system and provides a {@link INavigationProvider} instance that can be used to
 * access navigation functionality.
 * 
 * @see {@link INavigationProvider} - The provider interface for accessing navigation
 * @see {@link NavigationConfigurator} - The configurator class for setting up navigation
 * @see {@link enableNavigation} - Helper function to enable the navigation module
 * @see {@link module} - The module implementation instance
 */
export type NavigationModule = Module<
  typeof moduleKey,
  INavigationProvider,
  NavigationConfigurator
>;

/**
 * Navigation module implementation.
 * Provides routing and navigation capabilities compatible with industry-standard routers (Remix/React Router).
 *
 * @remarks
 * - Uses BaseConfigBuilder pattern with Zod validation
 * - Basename must match the URL path prefix where your app is served
 * - The router requires URL pathname to start with the basename
 */
export const module: NavigationModule = {
  version: new SemanticVersion(version),
  name: moduleKey,
  /**
   * Configures the navigation module.
   *
   * @returns A new NavigationConfigurator instance
   */
  configure: () => new NavigationConfigurator(),
  /**
   * Initializes the navigation module with validated configuration.
   *
   * @param init - Module initialization arguments
   * @returns A Promise that resolves to a new NavigationProvider instance
   */
  initialize: async (init) => {
    const config = await init.config.createConfigAsync(init);
    return new NavigationProvider({ version, config });
  },
  /**
   * Disposes of the navigation module instance.
   *
   * @param instance - The NavigationProvider instance to dispose
   */
  dispose({ instance }) {
    instance.dispose();
  },
};

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    navigation: NavigationModule;
  }
}
