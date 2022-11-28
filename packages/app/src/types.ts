import type {
    AppConfig,
    AppManifest,
    Fusion,
    FusionModulesInstance,
} from '@equinor/fusion-framework';
import type {
    AnyModule,
    CombinedModules,
    IModulesConfigurator,
} from '@equinor/fusion-framework-module';

import type { ModulesInstance } from '@equinor/fusion-framework-module';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import {
    configureHttp,
    configureHttpClient,
    HttpModule,
} from '@equinor/fusion-framework-module-http';
import type { MsalModule, configureMsal } from '@equinor/fusion-framework-module-msal';

export { AppManifest, AppConfig } from '@equinor/fusion-framework';

export interface IAppConfigurator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends FusionModulesInstance = FusionModulesInstance
> extends IModulesConfigurator<AppModules<TModules>, TRef> {
    configureHttp(...args: Parameters<typeof configureHttp>): void;

    configureHttpClient(...args: Parameters<typeof configureHttpClient>): void;

    configureMsal(...args: Parameters<typeof configureMsal>): void;
    useFrameworkServiceClient(serviceName: string): void;
}

export type AppEnv<TConfig = unknown, TProps = unknown> = {
    /** base routing path of the application */
    basename?: string;
    manifest?: AppManifest;
    config?: AppConfig<TConfig>;
    props?: TProps;
};

export type AppModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [ContextModule, EventModule, HttpModule, MsalModule]
>;

export type AppModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
    ModulesInstance<AppModules<TModules>>;

export type AppModuleInitiator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends Fusion = Fusion,
    TEnv = AppEnv
> = (
    configurator: IAppConfigurator<TModules, TRef['modules']>,
    args: { fusion: TRef; env: TEnv }
) => void | Promise<void>;

export type AppModuleInit<
    TModules extends Array<AnyModule> | unknown,
    TRef extends Fusion = Fusion,
    TEnv = AppEnv
> = (
    cb: AppModuleInitiator<TModules, TRef, TEnv>
) => (args: { fusion: TRef; env: TEnv }) => Promise<AppModulesInstance<TModules>>;
