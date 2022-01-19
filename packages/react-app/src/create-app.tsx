import { lazy } from 'react';

import {
    AnyModule,
    initializeModules,
    ModulesConfig,
    ModulesConfigType,
    ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import { ModuleProvider } from './modules';

import type { Fusion, AppManifest } from '@equinor/fusion-framework';

export { Fusion, AppManifest };

export interface AppConfigurator<TModules extends Array<AnyModule> = []> {
    (config: ModulesConfigType<TModules>, fusion: Fusion, env: AppManifest): void | Promise<void>;
}

export const createApp =
    <TModules extends Array<AnyModule>>(
        Component: React.ComponentType,
        configure: AppConfigurator<TModules>,
        modules?: TModules
    ) =>
    (fusion: Fusion, env: AppManifest): React.LazyExoticComponent<React.ComponentType> =>
        lazy(async () => {
            const configurator: ModulesConfigurator<TModules | Array<AnyModule>> = async (
                config
            ) => {
                await configure(config as ModulesConfig<TModules>, fusion, env);
            };
            const value = await initializeModules(configurator, modules || [], fusion.modules);
            return {
                default: () => (
                    <ModuleProvider value={value}>
                        <Component />
                    </ModuleProvider>
                ),
            };
        });

export default createApp;
