import type { Fusion } from '@equinor/fusion-framework';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type {
    AppConfig,
    AppManifest,
    AppModulesInstance,
} from '@equinor/fusion-framework-module-app';

import type { IAppConfigurator } from './AppConfigurator';

export type {
    AppModules,
    AppManifest,
    AppConfig,
    AppModulesInstance,
} from '@equinor/fusion-framework-module-app';

/**
 * Application environment args
 * Arguments provided when initializing/configuring application modules
 *
 * @template TConfig config value type
 * @template TProps [__not in use__] properties for application component
 */
export type AppEnv<TConfig = unknown, TProps = unknown> = {
    /** base routing path of the application */
    basename?: string;
    manifest: AppManifest;
    config?: AppConfig<TConfig>;
    props?: TProps;
};

/**
 * Blueprint for initializing application modules
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 * @template TEnv environment object for configuring modules
 */
export type AppModuleInitiator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends Fusion = Fusion,
    TEnv = AppEnv
> = (
    configurator: IAppConfigurator<TModules, TRef['modules']>,
    args: { fusion: TRef; env: TEnv }
) => void | Promise<void>;

/**
 * Blueprint for creating application initialization
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 * @template TEnv environment object for configuring modules
 */
export type AppModuleInit<
    TModules extends Array<AnyModule> | unknown,
    TRef extends Fusion = Fusion,
    TEnv = AppEnv
> = (
    cb: AppModuleInitiator<TModules, TRef, TEnv>
) => (args: { fusion: TRef; env: TEnv }) => Promise<AppModulesInstance<TModules>>;
