import type { Fusion } from '@equinor/fusion-framework';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type {
    WidgetManifest,
    WidgetModulesInstance,
    WidgetRenderArgs,
} from '@equinor/fusion-framework-module-widget';

import type { IWidgetConfigurator } from './WidgetConfigurator';

export type {
    WidgetManifest,
    WidgetModules,
    WidgetModulesInstance,
} from '@equinor/fusion-framework-module-widget';

/**
 * Application environment args
 * Arguments provided when initializing/configuring application modules
 *
 * @template TConfig config value type
 * @template TProps [__not in use__] properties for application component
 */
export type WidgetEnv<TProps = unknown> = {
    manifest: WidgetManifest;
    /** missing backend feature */
    config?: null;
    props?: TProps;
};

/**
 * Blueprint for initializing application modules
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 * @template TEnv environment object for configuring modules
 */
export type WidgetModuleInitiator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends Fusion = Fusion,
    TEnv = WidgetEnv,
> = (
    configurator: IWidgetConfigurator<TModules, TRef['modules']>,
    args: WidgetRenderArgs<TRef, TEnv>,
) => void | Promise<void>;

/**
 * Blueprint for creating application initialization
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 * @template TEnv environment object for configuring modules
 */
export type WidgetModuleInit<
    TModules extends Array<AnyModule> | unknown,
    TRef extends Fusion = Fusion,
    TEnv = WidgetEnv,
> = (
    cb: WidgetModuleInitiator<TModules, TRef, TEnv>,
) => (args: { fusion: TRef; env: TEnv }) => Promise<WidgetModulesInstance<TModules>>;
