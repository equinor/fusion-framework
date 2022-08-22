import { Fusion } from '@equinor/fusion-framework';

import { initializeModules, ModulesConfigType } from '@equinor/fusion-framework-module';
import type { AnyModule, ModulesInstanceType } from '@equinor/fusion-framework-module';

import appConfig from '@equinor/fusion-framework-module-app-config';
import type { AppConfigModule } from '@equinor/fusion-framework-module-app-config';

import http from '@equinor/fusion-framework-module-http';
import type { HttpModule } from '@equinor/fusion-framework-module-http';

import msal from '@equinor/fusion-framework-module-msal';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';

import event from '@equinor/fusion-framework-module-event';
import type {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

export type AppModules = [HttpModule, MsalModule, AppConfigModule, EventModule];

export const appModules = [http, msal, appConfig, event];

export type AppModulesInstance<TModules extends Array<AnyModule> = []> =
    ModulesInstanceType<AppModules> & ModulesInstanceType<TModules> & { dispose: VoidFunction };

export interface AppConfigurator<TModules extends Array<AnyModule> = []> {
    (
        configurator: ModulesConfigType<AppModules> & ModulesConfigType<TModules>,
        fusion: Fusion,
        env: AppManifest
    ): void | Promise<void>;
}

// TODO - import from app-module when created
export type AppManifest = {
    name: string;
};

export const initializeAppModules =
    <TModules extends Array<AnyModule>>(
        configure: AppConfigurator<TModules>,
        additionalModules?: TModules
    ) =>
    async (fusion: Fusion, manifest: AppManifest): Promise<AppModulesInstance<TModules>> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const configurator = async (config: any) => {
            if (configure) {
                await Promise.resolve(configure(config, fusion, manifest));
            }
        };
        const modules = (await initializeModules(
            configurator,
            appModules.concat(additionalModules || []) as [...AppModules, ...TModules],
            fusion.modules
            // TODO - fix typing
        )) as unknown as AppModulesInstance<TModules>;

        modules.event.dispatchEvent('onAppModulesLoaded', { detail: { modules, manifest } });

        return modules;
    };

export default initializeAppModules;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onAppModulesLoaded: FrameworkEvent<
            FrameworkEventInit<{
                modules: ModulesInstanceType<AppModules>;
                manifest: AppManifest;
            }>
        >;
    }
}
