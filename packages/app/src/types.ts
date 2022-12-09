import type {
    AppConfig,
    AppManifest,
    Fusion,
    FusionModulesInstance,
} from '@equinor/fusion-framework';

import type { AnyModule, IModulesConfigurator } from '@equinor/fusion-framework-module';

import { AppModules, AppModulesInstance } from '@equinor/fusion-framework-module-app';

import { configureHttp, configureHttpClient } from '@equinor/fusion-framework-module-http';
import type { configureMsal } from '@equinor/fusion-framework-module-msal';

export type {
    AppModules,
    AppManifest,
    AppConfig,
    AppModulesInstance,
} from '@equinor/fusion-framework-module-app';

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
    manifest: AppManifest;
    config?: AppConfig<TConfig>;
    props?: TProps;
};

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
