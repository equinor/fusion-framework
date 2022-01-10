import { FusionConfigurator, FusionModulesInstance, initializeFusionModules } from './modules';

export { FusionConfigurator };

export interface AppManifest {}

export interface Fusion {
    /**
     * Configured services for Fusion
     */
    modules: FusionModulesInstance;
    /**
     * Create a scoped instance of services
     */
    // createInstance: <TModule extends Module<any, any>>(
    //     configurator: ModulesConfigurator,
    //     modules: TModule[]
    // ) => Promise<ModuleType<Modules>>;
}

export const initFusion = async (init: FusionConfigurator): Promise<Fusion> => {
    const modules = await initializeFusionModules(init);
    const fusion = {
        modules,
    };
    window.Fusion = fusion;
    return fusion;
};

declare global {
    interface Window {
        Fusion: Fusion;
    }
}

export default initFusion;
