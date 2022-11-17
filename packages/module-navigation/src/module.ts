import {
    IModuleConfigurator,
    IModulesConfigurator,
    Module,
} from '@equinor/fusion-framework-module';
import { INavigationConfigurator, NavigationConfigurator } from './configurator';
import { INavigationProvider, NavigationProvider } from './provider';

export const moduleKey = 'navigation';

export type NavigationModule = Module<
    typeof moduleKey,
    INavigationProvider,
    INavigationConfigurator
>;

export const module: NavigationModule = {
    name: moduleKey,
    configure: () => new NavigationConfigurator(),
    initialize: ({ config }) => new NavigationProvider({ config }),
    dispose({ instance }) {
        instance.dispose();
    },
};

export const enableNavigation = <TRef = unknown>(
    config: IModulesConfigurator,
    options: Omit<IModuleConfigurator<NavigationModule, TRef>, 'module'>
): void => {
    config.addConfig({ module, ...options });
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        navigation: NavigationModule;
    }
}
