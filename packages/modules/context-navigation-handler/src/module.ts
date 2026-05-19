import type { Module } from '@equinor/fusion-framework-module';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import type { EventModule } from '@equinor/fusion-framework-module-event';

import { ContextNavigationHandlerConfigurator } from './configurator';
import { ContextNavigationHandlerProvider } from './provider';

export type ContextNavigationHandlerModuleKey = 'context-navigation-handler';
export const moduleKey: ContextNavigationHandlerModuleKey = 'context-navigation-handler';

export type ContextNavigationHandlerModule = Module<
  ContextNavigationHandlerModuleKey,
  ContextNavigationHandlerProvider,
  ContextNavigationHandlerConfigurator,
  [AppModule, NavigationModule, ContextModule, EventModule]
>;

export const module: ContextNavigationHandlerModule = {
  name: moduleKey,
  configure: () => new ContextNavigationHandlerConfigurator(),
  initialize: async (args) => {
    const config = await (args.config as ContextNavigationHandlerConfigurator).createConfigAsync(
      args,
    );

    const app = await args.requireInstance('app');
    const navigation = await args.requireInstance('navigation');
    const context = await args.requireInstance('context');
    const event = await args.requireInstance('event');

    // Resolve initial context from URL before the provider starts
    await config.resolveInitialContext?.({ context, navigation });

    return new ContextNavigationHandlerProvider({
      app,
      navigation,
      context,
      event,
      config,
    });
  },
  dispose: (args) => {
    args.instance.dispose();
  },
};
