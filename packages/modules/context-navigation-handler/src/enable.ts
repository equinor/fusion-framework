import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { ContextNavigationHandlerConfigurator } from './configurator';
import { module } from './module';

/**
 * Enables the event-driven context-to-URL reconciler for a portal.
 *
 * @example
 * ```ts
 * // Minimal — all defaults (path strategy, URL guard on)
 * enableContextNavigationHandler(configurator);
 *
 * // With configuration
 * enableContextNavigationHandler(configurator, (builder) => {
 *   builder.setPortalName('dev-portal');
 *   builder.setDebug(true);
 *   builder.setUrlGuard(true);
 *   builder.setOnTransition((detail) => {
 *     console.log(`Navigated to ${detail.targetURL.pathname}`);
 *   });
 * });
 * ```
 */
export const enableContextNavigationHandler = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  builder?: (builder: ContextNavigationHandlerConfigurator) => void,
): void => {
  configurator.addConfig({
    module,
    configure: (handlerConfigurator) => {
      builder?.(handlerConfigurator);
    },
  });
};
