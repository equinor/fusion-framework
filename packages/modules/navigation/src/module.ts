import {
    IModuleConfigurator,
    IModulesConfigurator,
    Module,
    ModuleConfigType,
    ModuleInstance,
} from '@equinor/fusion-framework-module';
import { INavigationConfigurator, NavigationConfigurator } from './configurator';
import { createHistory } from './createHistory';
import { INavigationProvider, NavigationProvider } from './provider';

export const moduleKey = 'navigation';

export type NavigationModule = Module<
    typeof moduleKey,
    INavigationProvider,
    INavigationConfigurator
>;

export const module: NavigationModule = {
    name: moduleKey,
    configure: (ref?: unknown) => {
        const configurator = new NavigationConfigurator();
        if (ref) {
            configurator.history = (ref as ModuleInstance).navigation.navigator;
        }
        return configurator;
    },
    initialize: ({ config }) => {
        config.history ??= createHistory();
        return new NavigationProvider({ config });
    },
    dispose({ instance }) {
        instance.dispose();
    },
};

export const enableNavigation = <TRef = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    basenameOrOptions?: string | Omit<IModuleConfigurator<NavigationModule, TRef>, 'module'>
): void => {
    const options =
        typeof basenameOrOptions === 'string'
            ? {
                  configure: (config: ModuleConfigType<NavigationModule>) => {
                      config.basename = basenameOrOptions;
                  },
              }
            : basenameOrOptions;
    configurator.addConfig({ module, ...options });
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        navigation: NavigationModule;
    }
}
