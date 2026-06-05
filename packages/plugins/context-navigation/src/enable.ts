import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { createPlugin } from '@equinor/fusion-framework-module/configurator';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { ContextNavigationConfigurator } from './configurator';
import { createContextNavigationPlugin } from './plugin';

type ContextNavigationModules = [AppModule, NavigationModule, ContextModule, EventModule];

export type ContextNavigationBuilder = (
  builder: ContextNavigationConfigurator,
) => void | Promise<void>;

/**
 * Registers the event-driven context-to-URL reconciler plugin for a portal.
 *
 * @example
 * ```ts
 * // Minimal — all defaults (built-in adapters: custom > query > path)
 * enableContextNavigation(configurator);
 *
 * // With custom adapter
 * enableContextNavigation(configurator, (builder) => {
 *   builder.setPortalName('my-portal');
 *   builder.setDebug(true);
 *   builder.registerAdapter(myHashAdapter);
 * });
 * ```
 */
export const enableContextNavigation = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  builder?: ContextNavigationBuilder,
): void => {
  configurator.registerPlugin<ContextNavigationModules>(
    createPlugin('contextNavigation', async (modules) => {
      const contextNavigationConfigurator = new ContextNavigationConfigurator();

      await builder?.(contextNavigationConfigurator);

      const config = contextNavigationConfigurator.createConfig();

      await config.resolveInitialContext?.({
        context: modules.context,
        navigation: modules.navigation,
      });

      return createContextNavigationPlugin({
        app: modules.app,
        navigation: modules.navigation,
        context: modules.context,
        event: modules.event,
        config,
      });
    }),
  );
};
