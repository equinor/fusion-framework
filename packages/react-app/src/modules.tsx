/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    initializeModules,
    ModulesConfigurator,
    AnyModule,
} from '@equinor/fusion-framework-module';
import { createContext, lazy, useContext } from 'react';

const moduleContext = createContext<any>(null);

export const ModuleProvider = moduleContext.Provider;

type ModuleProviderCreator = <TModules extends Array<AnyModule> = Array<AnyModule>>(
    configurator: ModulesConfigurator<TModules>,
    modules: TModules
) => Promise<React.LazyExoticComponent<React.FunctionComponent>>;

export const createModuleProvider: ModuleProviderCreator = async <
    TModules extends Array<AnyModule>
>(
    configurator: ModulesConfigurator<TModules>,
    modules: TModules
): Promise<React.LazyExoticComponent<React.FunctionComponent>> => {
    const Component = lazy(async () => {
        const value = await initializeModules(configurator, modules);
        return {
            default: ({ children }: { children?: React.ReactNode }) => (
                <ModuleProvider value={value}>{children}</ModuleProvider>
            ),
        };
    });
    return Component;
};

export const useModuleContext = <T extends any>() => useContext(moduleContext) as T;
