import type { AppConfig, AppManifest, AppModulesInstance, AppScriptModule } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppBundleState<TConfig = any, TModules = any> = {
    appKey: string;
    status: Set<string>;
    manifest?: AppManifest;
    config?: AppConfig<TConfig>;
    modules?: AppScriptModule;
    instance?: AppModulesInstance<TModules>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppBundleStateInitial<TConfig = any, TModules = any> = Omit<
    AppBundleState<TConfig, TModules>,
    'status'
>;
