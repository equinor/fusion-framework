import { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { AppConfigurator } from './configurator';
import type { AppModulesInstance, AppModuleInitiator, AppEnv } from './types';

export const configureModules =
    <
        TModules extends Array<AnyModule> | never,
        TRef extends Fusion = Fusion,
        TEnv extends AppEnv = AppEnv
    >(
        cb?: AppModuleInitiator<TModules, TRef, TEnv>
    ): ((args: { fusion: TRef; env: TEnv }) => Promise<AppModulesInstance<TModules>>) =>
    async (args: { fusion: TRef; env: TEnv }): Promise<AppModulesInstance<TModules>> => {
        const configurator = new AppConfigurator<TModules, TRef['modules']>();
        if (cb) {
            await Promise.resolve(cb(configurator, args));
        }
        const modules = (await configurator.initialize(
            args.fusion.modules
        )) as AppModulesInstance<TModules>;

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
