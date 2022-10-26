import { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import { AppConfigurator } from './configurator';
import type { AppModulesInstance, AppModuleInitiator, AppEnv } from './types';

export const configureModules =
    <TModules extends Array<AnyModule> | never, TRef extends Fusion = Fusion, TEnv = AppEnv>(
        cb?: AppModuleInitiator<TModules, TRef, TEnv>
    ): ((args: { fusion: TRef; env: TEnv }) => Promise<AppModulesInstance<TModules>>) =>
    async (args: { fusion: TRef; env: TEnv }): Promise<AppModulesInstance<TModules>> => {
        const configurator = new AppConfigurator<TModules, TRef['modules']>();
        if (cb) {
            await Promise.resolve(cb(configurator, args));
        }
        const modules = await configurator.initialize(args.fusion.modules);
        modules.event.dispatchEvent('onAppModulesLoaded', {
            detail: { modules, env: args.env },
        });
        return modules as unknown as AppModulesInstance<TModules>;
    };

export default configureModules;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onAppModulesLoaded: FrameworkEvent<
            FrameworkEventInit<{
                modules: AppModulesInstance;
                env: AppEnv;
            }>
        >;
    }
}
