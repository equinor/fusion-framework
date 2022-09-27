import type { Fusion, FusionModulesInstance } from '@equinor/fusion-framework';
import type {
    AnyModule,
    CombinedModules,
    IModulesConfigurator,
} from '@equinor/fusion-framework-module';

import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { AppConfigModule } from '@equinor/fusion-framework-module-app-config';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import {
    configureHttp,
    configureHttpClient,
    HttpModule,
} from '@equinor/fusion-framework-module-http';
import type { MsalModule, configureMsal } from '@equinor/fusion-framework-module-msal';

export interface IAppConfigurator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends FusionModulesInstance = FusionModulesInstance
> extends IModulesConfigurator<AppModules<TModules>, TRef> {
    configureHttp(...args: Parameters<typeof configureHttp>): void;

    configureHttpClient(...args: Parameters<typeof configureHttpClient>): void;

    configureMsal(...args: Parameters<typeof configureMsal>): void;
    useFrameworkServiceClient(serviceName: string): void;
}

// TODO
// eslint-disable-next-line @typescript-eslint/ban-types
export type AppManifest = {};

export type AppModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [EventModule, HttpModule, MsalModule, AppConfigModule]
>;

export type AppModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
    ModulesInstance<AppModules<TModules>>;

export type AppModuleInitiator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef = Fusion,
    TManifest = AppManifest
> = (
    configurator: IAppConfigurator<TModules>,
    args: { fusion: TRef; manifest: TManifest }
) => void | Promise<void>;

export type AppModuleInit<
    TModules extends Array<AnyModule> | unknown,
    TRef = Fusion,
    TManifest = AppManifest
> = (
    cb: AppModuleInitiator<TModules, TRef, TManifest>
) => (args: { fusion: TRef; manifest: TManifest }) => Promise<AppModulesInstance<TModules>>;
