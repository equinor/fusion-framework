import { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { AppConfigurator } from './AppConfigurator';
import type { AppModulesInstance, AppModuleInitiator, AppEnv } from './types';

/**
 * 
 * Creates a callback for initializing configuration of application modules
 * 
 * @example
 ```ts
    const initialize =  configureModules((configurator, args) => {
        configurator.configure(someModule);
    });
    await initialize({ fusion, { manifest, config }});
 ```
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 * @template TEnv environment object for configuring modules
 * 
 * @param cb configuration callback
 * 
 * @returns initialize function, executes configurator
 */
export const configureModules =
    <
        TModules extends Array<AnyModule> | never,
        TRef extends Fusion = Fusion,
        TEnv extends AppEnv = AppEnv
    >(
        cb?: AppModuleInitiator<TModules, TRef, TEnv>
    ): ((args: { fusion: TRef; env: TEnv }) => Promise<AppModulesInstance<TModules>>) =>
    /**
     *
     * Callback for initializing application modules
     *
     * @param args - Fusion and application  environments (manifest, config ...)
     * @returns initialized app modules
     */
    async (args: { fusion: TRef; env: TEnv }): Promise<AppModulesInstance<TModules>> => {
        const configurator = new AppConfigurator<TModules, TRef['modules']>();
        if (cb) {
            await Promise.resolve(cb(configurator, args));
        }
        const modules = (await configurator.initialize(
            args.fusion.modules
            // TODO
        )) as unknown as AppModulesInstance<TModules>;

        // @eikeland
        // TODO - remove check after fusion-cli is updated (app module is not enabled in fusion-cli)
        if (args.env.manifest?.key) {
            modules.event.dispatchEvent('onAppModulesLoaded', {
                detail: { appKey: args.env.manifest.key, modules },
            });
        }
        return modules;
    };

export default configureModules;
