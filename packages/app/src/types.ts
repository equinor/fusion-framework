import type { Fusion, FusionModulesInstance } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import type { ModulesConfigurator, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import {
    configureHttp,
    configureHttpClient,
    HttpModule,
} from '@equinor/fusion-framework-module-http';
import type { MsalModule, configureMsal } from '@equinor/fusion-framework-module-msal';
import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';

export interface IAppConfigurator<
    TModules extends Array<AnyModule> = [],
    TRef extends FusionModulesInstance = FusionModulesInstance
> extends ModulesConfigurator<AppModules<TModules>, TRef> {
    configureHttp(...args: Parameters<typeof configureHttp>): void;

    configureHttpClient(...args: Parameters<typeof configureHttpClient>): void;

    configureMsal(...args: Parameters<typeof configureMsal>): void;
    useFrameworkServiceClient<T extends Fusion = Fusion>(
        fusion: T,
        serviceName: Parameters<IServiceDiscoveryProvider['configureClient']>[1]
    ): ReturnType<IServiceDiscoveryProvider['configureClient']>;
}

// TODO
// eslint-disable-next-line @typescript-eslint/ban-types
export type AppManifest = {};

export type AppModules<TModules extends Array<AnyModule> = []> = [
    ...TModules,
    EventModule,
    HttpModule,
    MsalModule
];

export type AppModulesInstance<TModules extends Array<AnyModule> = []> = ModulesInstance<
    AppModules<TModules>
>;

export type AppModuleInitiator<
    TModules extends Array<AnyModule> = [],
    TRef = Fusion,
    TManifest = AppManifest
> = (
    configurator: IAppConfigurator<TModules>,
    args: { fusion: TRef; manifest: TManifest }
) => void | Promise<void>;

export type AppModuleInit<
    TModules extends Array<AnyModule> = [],
    TRef = Fusion,
    TManifest = AppManifest
> = (
    cb: AppModuleInitiator<TModules, TRef, TManifest>
) => (args: { fusion: TRef; manifest: TManifest }) => Promise<AppModulesInstance<TModules>>;
