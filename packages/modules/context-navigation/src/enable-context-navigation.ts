import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { ContextNavigationConfigurator } from './configurator';
import { module } from './module';

/**
 * Enables context-to-URL navigation synchronization for a portal.
 *
 * @example
 * ```ts
 * // Minimal — all defaults
 * enableContextNavigation(configurator);
 *
 * // With configuration
 * enableContextNavigation(configurator, (builder) => {
 *   builder.setConsoleDebug(true);
 *   builder.enableTelemetry(true);
 *   builder.setOnCustomStrategyDetected((appKey) => {
 *     console.warn(`App [${appKey}] uses custom routing strategy`);
 *   });
 * });
 * ```
 */
export const enableContextNavigation = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  builder?: (builder: ContextNavigationConfigurator) => void,
): void => {
  configurator.addConfig({
    module,
    configure: (contextNavigationConfigurator) => {
      builder?.(contextNavigationConfigurator);
    },
  });
};
