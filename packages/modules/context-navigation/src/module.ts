import type { Module } from '@equinor/fusion-framework-module';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { ContextNavigationConfigurator } from './configurator';
import { ContextNavigationProvider } from './provider';

export type ContextNavigationModuleKey = 'context-navigation';
export const moduleKey: ContextNavigationModuleKey = 'context-navigation';

export type ContextNavigationModule = Module<
  ContextNavigationModuleKey,
  ContextNavigationProvider,
  ContextNavigationConfigurator,
  [AppModule, NavigationModule, ContextModule]
>;

export const module: ContextNavigationModule = {
  name: moduleKey,
  configure: () => new ContextNavigationConfigurator(),
  initialize: async (args) => {
    const config = await (args.config as ContextNavigationConfigurator).createConfigAsync(args);

    const app = await args.requireInstance('app');
    const navigation = await args.requireInstance('navigation');
    const context = await args.requireInstance('context');

    // Telemetry is optional — only resolve if the module is registered
    // biome-ignore lint/suspicious/noExplicitAny: telemetry module type not in deps array
    const telemetry = args.hasModule('telemetry')
      ? await (args as unknown as { requireInstance(key: string): Promise<any> }).requireInstance(
          'telemetry',
        )
      : undefined;

    return new ContextNavigationProvider({
      app,
      navigation,
      context,
      config,
      telemetry,
    });
  },
  dispose: (args) => {
    args.instance.dispose();
  },
};
