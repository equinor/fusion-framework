/* eslint-disable @typescript-eslint/no-empty-interface */
import { AnyModule } from '@equinor/fusion-framework-module';
import { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import { FusionConfigurator, FusionModulesInstance, initializeFusionModules } from './modules';

export type { FusionConfigurator, FusionModules } from './modules';

export interface AppManifest {}

export interface Fusion<TModules extends Array<AnyModule> = Array<AnyModule>> {
    /**
     * Configured services for Fusion
     */
    modules: FusionModulesInstance<TModules>;
    /**
     * Create a scoped instance of services
     */
    // createInstance: <TModule extends Module<any, any>>(
    //     configurator: ModulesConfigurator,
    //     modules: TModule[]
    // ) => Promise<ModuleType<Modules>>;
}

export const initFusion = async <TModules extends Array<AnyModule> = Array<AnyModule>>(
    init: FusionConfigurator<TModules>,
    additionalModules?: TModules
): Promise<Fusion<TModules>> => {
    const modules = await initializeFusionModules(init, additionalModules);
    const fusion = {
        modules,
    };
    window.Fusion = fusion;

    modules.event.dispatchEvent('onFrameworkLoaded', { detail: fusion });

    return fusion;
};

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onFrameworkLoaded: FrameworkEvent<FrameworkEventInit<Fusion>>;
    }
}

declare global {
    interface Window {
        Fusion: Fusion;
    }
}

export default initFusion;
