import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { ContextNavigationHandlerConfigurator } from './configurator';
import { module } from './module';

/**
 * Enables the event-driven context-to-URL reconciler for a portal.
 *
 * @example
 * ```ts
 * // Minimal — all defaults (built-in adapters: custom > query > path)
 * enableContextNavigationHandler(configurator);
 *
 * // With custom adapter
 * enableContextNavigationHandler(configurator, (builder) => {
 *   builder.setPortalName('my-portal');
 *   builder.setDebug(true);
 *   builder.registerAdapter(myHashAdapter);
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
