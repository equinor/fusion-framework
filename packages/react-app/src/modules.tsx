import { createContext, lazy, useContext } from 'react';

import {
    initializeModules,
    ModulesConfigurator,
    AnyModule,
} from '@equinor/fusion-framework-module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useModuleContext = <T extends any>(): T => useContext(moduleContext) as T;
