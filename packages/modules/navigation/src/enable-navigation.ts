import type { IModulesConfigurator, ModuleConfigType } from '@equinor/fusion-framework-module';
import { module, type NavigationModule } from './module.js';
import type { NavigationInitiator } from './NavigationInitiator.js';

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
 * @param basenameOrOptions.configure - Configuration callback for advanced setup. Settings
 *   made here are explicit app configuration and take precedence over the initiator.
 * @param basenameOrOptions.initiator - Navigation strategy supplied by the app/widget
 *   initiator (`host` or `memory`). Applied below explicit configuration; an explicit
 *   setting that violates a required host constraint fails startup.
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
 *
 * // Adopt the strategy supplied by the portal or widget
 * enableNavigation(configurator, { initiator: env.navigation });
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
        configure?: (config: ModuleConfigType<NavigationModule>, ref: TRef) => void;
        initiator?: NavigationInitiator;
      },
): void => {
  configurator.addConfig({
    module,
    configure(config, ref) {
      // A string shortcut sets the basename directly; otherwise defer to the caller's configure callback.
      if (typeof basenameOrOptions === 'string') {
        config.setBasename(basenameOrOptions);
      } else if (typeof basenameOrOptions === 'object') {
        // Initiator first: it is the fallback, so explicit settings made by `configure` outrank it.
        config.setInitiator(basenameOrOptions.initiator);
        basenameOrOptions.configure?.(config, ref);
      }
    },
  });
};

export default enableNavigation;
