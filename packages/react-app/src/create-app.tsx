/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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

/** default modules provided to apps */
import http, { HttpModule } from '@equinor/fusion-framework-module-http';
import msal, { MsalModule } from '@equinor/fusion-framework-module-msal';

export type AppModules = [HttpModule, MsalModule];

export { Fusion, AppManifest };

export interface AppConfigurator<TModules extends Array<AnyModule> = []> {
    (config: ModulesConfigType<TModules>, fusion: Fusion, env: AppManifest): void | Promise<void>;
}

export const createApp =
    <TModules extends Array<AnyModule>>(
        Component: React.ComponentType,
        configure: AppConfigurator<TModules & AppModules>,
        modules: TModules = [] as unknown as TModules
    ) =>
    (fusion: Fusion, env: AppManifest): React.LazyExoticComponent<React.ComponentType> =>
        lazy(async () => {
            const configurator: ModulesConfigurator<AppModules & TModules> = async (config) => {
                await configure(
                    config as unknown as ModulesConfig<AppModules & TModules>,
                    fusion,
                    env
                );
            };
            const value = await initializeModules<AppModules & TModules>(
                configurator,
                [http, msal].concat(modules) as AppModules & TModules,
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
