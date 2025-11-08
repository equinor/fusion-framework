import type { IModulesConfigurator, ModuleConfigType } from '@equinor/fusion-framework-module';
import { module, type NavigationModule } from './module';

/**
 * Helper function to enable the navigation module.
 * 
 * This is the main entry point for consumers to add navigation capabilities to their
 * framework configuration. It registers the navigation module and allows configuration
 * of basename and other navigation settings.
 * 
 * The navigation module provides routing and navigation capabilities compatible with
 * industry-standard routers (Remix/React Router), with support for browser history,
 * hash routing, and memory history.
 * 
 * @param configurator - The modules configurator to add navigation to
 * @param basenameOrOptions - Optional basename string or configuration object
 * @param basenameOrOptions.configure - Configuration callback for advanced setup
 * @typeParam TRef - Reference type for module composition
 * 
 * @example
 * ```ts
 * // Simple usage with basename
 * enableNavigation(configurator, '/app');
 * 
 * // Advanced configuration
 * enableNavigation(configurator, {
 *   configure(config, ref) {
 *     config.setBasename('/app');
 *     config.setHistory(createHistory('browser'));
 *   }
 * });
 * ```
 * 
 * @see {@link NavigationModule} - The navigation module type
 * @see {@link INavigationConfigurator} - Configuration interface
 * @see {@link INavigationProvider} - Provider interface for accessing navigation
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

export default enableNavigation;
