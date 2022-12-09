import type { AppConfig, AppManifest, AppModulesInstance, AppScriptModule } from '../types';

export type AppBundleState<TConfig = any, TModules = any> = {
    appKey: string;
    status: Set<string>;
    manifest?: AppManifest;
    config?: AppConfig<TConfig>;
    modules?: AppScriptModule;
    instance?: AppModulesInstance<TModules>;
};
