import { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import { AppConfigurator } from './configurator';
import type { AppManifest, AppModulesInstance, AppModuleInitiator } from './types';

export const initAppModules =
    <
        TModules extends Array<AnyModule> | never,
        TRef extends Fusion = Fusion,
        TManifest = AppManifest
    >(
        cb?: AppModuleInitiator<TModules, TRef, TManifest>
    ): ((args: { fusion: TRef; manifest: TManifest }) => Promise<AppModulesInstance<TModules>>) =>
    async (args: { fusion: TRef; manifest: TManifest }): Promise<AppModulesInstance<TModules>> => {
        const configurator = new AppConfigurator<TModules, TRef['modules']>();
        if (cb) {
            await Promise.resolve(cb(configurator, args));
        }
        const modules = await configurator.initialize(args.fusion.modules);
        modules.event.dispatchEvent('onAppModulesLoaded', {
            detail: { modules, manifest: args.manifest },
        });
        return modules as unknown as AppModulesInstance<TModules>;
    };

export default initAppModules;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onAppModulesLoaded: FrameworkEvent<
            FrameworkEventInit<{
                modules: AppModulesInstance;
                manifest: AppManifest;
            }>
        >;
    }
}
