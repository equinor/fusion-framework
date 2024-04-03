import type { Fusion } from '@equinor/fusion-framework';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type {
    AppConfig,
    AppManifest,
    AppModulesInstance,
    ComponentRenderArgs,
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
    TEnv = AppEnv,
> = (
    configurator: IAppConfigurator<TModules, TRef['modules']>,
    args: { fusion: TRef; env: TEnv },
) => void | Promise<void>;

/**
 * Blueprint for creating application initialization
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 * @template TEnv environment object for configuring modules
 */
export type AppModuleInit<
    TModules extends Array<AnyModule> | unknown = [],
    TRef extends Fusion = Fusion,
    TEnv = AppEnv,
> = (
    cb: AppModuleInitiator<TModules, TRef, TEnv>,
) => (args: AppModuleInitArgs<TRef, TEnv>) => Promise<AppModulesInstance<TModules>>;

export type AppModuleInitArgs<TRef extends Fusion = Fusion, TEnv = AppEnv> = {
    fusion: TRef;
    env: TEnv;
};

/**
 * Type definition for AppRenderFn.
 * This type is responsible for rendering the application within a given environment.
 * It takes a generic `TFusion` type parameter extending `Fusion` for the Fusion instance,
 * and an optional `TEnv` type parameter for the application environment, defaulting to `AppEnv`.
 *
 * @param el - The root document element where the application will be rendered.
 * @param args - An object containing arguments required for component rendering, including the Fusion instance and environment-specific configurations.
 * @returns A function that can be invoked to perform cleanup operations, or `void` if no cleanup is necessary.
 *
 * @example
 * const renderMyApp: AppRenderFn = (el, args) => {
 *   // Implementation for rendering the application
 *   // Optionally return a cleanup function
 * };
 */
export type AppRenderFn<TFusion extends Fusion = Fusion, TEnv = AppEnv> = (
    el: HTMLHtmlElement,
    args: ComponentRenderArgs<TFusion, TEnv>,
) => VoidFunction | void;
