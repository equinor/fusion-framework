/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { lazy } from 'react';

import { AnyModule, initializeModules, ModulesConfigType } from '@equinor/fusion-framework-module';

import type { Fusion, AppManifest } from '@equinor/fusion-framework';

import { ModuleProvider, appModules, AppModules } from './modules';

export interface AppConfigurator<TModules extends Array<AnyModule> = []> {
    (
        config: ModulesConfigType<AppModules> & ModulesConfigType<TModules>,
        fusion: Fusion,
        env: AppManifest
    ): void | Promise<void>;
}

export const createApp =
    <TModules extends Array<AnyModule>>(
        Component: React.ComponentType,
        configure: AppConfigurator<TModules>,
        modules: TModules = [] as unknown as TModules
    ) =>
    (fusion: Fusion, env: AppManifest): React.LazyExoticComponent<React.ComponentType> =>
        lazy(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const configurator = async (config: any) => {
                await configure(config, fusion, env);
            };
            const value = await initializeModules(
                configurator,
                appModules.concat(modules),
                fusion.modules
            );
            return {
                default: () => (
                    <ModuleProvider value={value}>
                        <Component />
                    </ModuleProvider>
                ),
            };
        });

export default createApp;
